import time
import datetime
import os
import psutil
from django.conf import settings
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ChatMessage, ActivityLog
from .serializers import (
    ChatRequestSerializer,
    ChatResponseSerializer,
    ChatMessageSerializer,
    ActivityLogSerializer
)

try:
    from groq import Groq, GroqError, RateLimitError, AuthenticationError, APIConnectionError
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False


def get_system_telemetry():
    """Retrieve real-time machine telemetry using psutil with fallback defaults."""
    try:
        cpu_percent = psutil.cpu_percent(interval=0.1)
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        net_io = psutil.net_io_counters()
        
        return {
            "cpu_percent": round(cpu_percent, 1),
            "memory_percent": round(mem.percent, 1),
            "memory_used_gb": round(mem.used / (1024 ** 3), 2),
            "memory_total_gb": round(mem.total / (1024 ** 3), 2),
            "disk_percent": round(disk.percent, 1),
            "disk_free_gb": round(disk.free / (1024 ** 3), 2),
            "bytes_sent_mb": round(net_io.bytes_sent / (1024 ** 2), 2),
            "bytes_recv_mb": round(net_io.bytes_recv / (1024 ** 2), 2),
            "core_count": psutil.cpu_count(logical=True),
        }
    except Exception:
        return {
            "cpu_percent": 18.5,
            "memory_percent": 42.1,
            "memory_used_gb": 6.7,
            "memory_total_gb": 16.0,
            "disk_percent": 55.4,
            "disk_free_gb": 230.5,
            "bytes_sent_mb": 142.3,
            "bytes_recv_mb": 894.2,
            "core_count": 8,
        }


def detect_client_intent(message_text):
    """Detect special browser actions to provide rich action metadata."""
    msg = message_text.lower().strip()
    
    if "open youtube" in msg or "launch youtube" in msg:
        return {
            "action": "open_url",
            "action_data": {"url": "https://www.youtube.com", "target": "YouTube", "title": "YouTube"}
        }
    elif "search the web for" in msg or "search web for" in msg or "google" in msg:
        query = msg.replace("search the web for", "").replace("search web for", "").replace("google", "").strip()
        return {
            "action": "web_search",
            "action_data": {"query": query, "url": f"https://www.google.com/search?q={query}"}
        }
    elif "open calculator" in msg or "launch calculator" in msg:
        return {
            "action": "open_tool",
            "action_data": {"tool": "calculator", "title": "Quantum Calculator"}
        }
    elif "open files" in msg or "view files" in msg or "open file" in msg:
        return {
            "action": "open_tool",
            "action_data": {"tool": "files", "title": "Arc Data Archives"}
        }
    elif "weather" in msg and len(msg.split()) < 5:
        return {
            "action": "open_tool",
            "action_data": {"tool": "weather", "title": "Atmospheric Scanner"}
        }
    elif "system status" in msg or "diagnostics" in msg:
        return {
            "action": "system_status",
            "action_data": get_system_telemetry()
        }
    return None


class ChatAPIView(APIView):
    """
    POST /api/chat/
    Processes user voice/text commands, calls Groq AI with JARVIS persona,
    and returns rich response payload with response time and telemetry.
    """

    def post(self, request, *args, **kwargs):
        start_time = time.time()
        
        # 1. Validate payload
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "error": "Invalid request payload",
                    "details": serializer.errors,
                    "reply": "Sir, I didn't catch that. Could you please repeat your command?",
                    "timestamp": timezone.now().isoformat(),
                    "response_time": 0.01,
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data
        user_message = data['message'].strip()
        is_voice = data.get('is_voice', False)
        conversation_history = data.get('history', [])

        # 2. Persist User Message to DB
        ChatMessage.objects.create(
            sender='user',
            message=user_message,
            is_voice=is_voice,
            timestamp=timezone.now()
        )

        ActivityLog.objects.create(
            action="User Query Received",
            details=f"Query: '{user_message[:60]}...' (Voice: {is_voice})",
            severity='info'
        )

        # 3. Check for specific action triggers
        intent = detect_client_intent(user_message)
        action_name = intent["action"] if intent else None
        action_data = intent["action_data"] if intent else None

        # Reload .env dynamically so key edits take effect immediately
        try:
            from dotenv import load_dotenv
            load_dotenv(settings.BASE_DIR / '.env', override=True)
            load_dotenv(settings.BASE_DIR.parent / '.env', override=True)
        except Exception:
            pass

        groq_api_key = os.getenv('GROQ_API_KEY', '').strip() or getattr(settings, 'GROQ_API_KEY', '').strip()
        model_name = os.getenv('GROQ_MODEL', '').strip() or getattr(settings, 'GROQ_MODEL', 'openai/gpt-oss-120b')
        system_prompt = getattr(settings, 'JARVIS_SYSTEM_PROMPT', 'You are JARVIS.')

        reply_text = ""
        used_model = model_name

        # 4. Generate AI response using Groq API
        is_real_key = bool(
            groq_api_key and 
            groq_api_key.strip() != "" and 
            not groq_api_key.startswith("gsk_your_") and 
            "your_groq_api_key" not in groq_api_key
        )

        if is_real_key and GROQ_AVAILABLE:
            try:
                client = Groq(api_key=groq_api_key)
                
                messages = [{"role": "system", "content": system_prompt}]
                
                # Append relevant recent context if provided (up to last 6 turns)
                if conversation_history:
                    for item in conversation_history[-6:]:
                        role = "assistant" if item.get('sender') == 'jarvis' else "user"
                        content = item.get('message', '').strip()
                        if content:
                            messages.append({"role": role, "content": content})
                
                preferred_models = []
                if model_name:
                    preferred_models.append(model_name)

                standard_fallbacks = [
                    "llama-3.1-8b-instant",
                    "llama-3.3-70b-versatile",
                    "openai/gpt-oss-20b",
                    "qwen/qwen3-32b"
                ]
                for fallback in standard_fallbacks:
                    if fallback not in preferred_models:
                        preferred_models.append(fallback)

                chat_completion = None
                last_error = None

                for candidate in preferred_models[:4]:
                    try:
                        chat_completion = client.chat.completions.create(
                            messages=messages,
                            model=candidate,
                            temperature=0.7,
                            max_tokens=350,
                            top_p=1,
                            stream=False,
                            timeout=15,
                        )
                        used_model = candidate
                        break
                    except Exception as mod_err:
                        last_error = mod_err
                        err_str = str(mod_err).lower()
                        if any(token in err_str for token in ["404", "not_found", "access", "permission", "timeout", "timed out"]):
                            continue
                        else:
                            raise mod_err

                if chat_completion:
                    reply_text = chat_completion.choices[0].message.content.strip()
                    ActivityLog.objects.create(
                        action="Groq API Response Generated",
                        details=f"Model: {used_model} | Response length: {len(reply_text)} chars",
                        severity='success'
                    )
                else:
                    raise last_error or Exception("No candidate model available on your Groq tier")

            except AuthenticationError:
                used_model = "offline-protocol"
                reply_text = (
                    "Sir, it appears the Groq API key is invalid or unauthorized. "
                    "Please verify the GROQ_API_KEY in your jarvis_backend/.env configuration file."
                )
                ActivityLog.objects.create(
                    action="Groq Auth Error",
                    details="Invalid GROQ_API_KEY provided in .env",
                    severity='error'
                )
            except RateLimitError:
                used_model = "offline-protocol"
                reply_text = (
                    "Sir, we have momentarily exceeded the Groq API rate limit. "
                    "All auxiliary sub-routines remain operational. Please try again shortly."
                )
                ActivityLog.objects.create(
                    action="Groq Rate Limit",
                    details="Rate limit hit on Groq API",
                    severity='warning'
                )
            except APIConnectionError:
                used_model = "offline-protocol"
                reply_text = (
                    "Sir, the neural uplink to Groq servers experienced a connection timeout. "
                    "I am currently operating on local contingency protocols."
                )
                ActivityLog.objects.create(
                    action="Groq Connection Error",
                    details="Failed to connect to Groq endpoints",
                    severity='error'
                )
            except GroqError as e:
                used_model = "offline-protocol"
                reply_text = f"Sir, a core diagnostic anomaly occurred with the Groq uplink: {str(e)}"
                ActivityLog.objects.create(
                    action="Groq API Error",
                    details=str(e),
                    severity='error'
                )
            except Exception as e:
                used_model = "offline-protocol"
                reply_text = f"Sir, an unexpected computational error was encountered: {str(e)}"
                ActivityLog.objects.create(
                    action="Unexpected Processing Error",
                    details=str(e),
                    severity='error'
                )
        else:
            # Fallback heuristic engine when GROQ_API_KEY is not configured or dummy
            used_model = "jarvis-heuristic-core"
            lower_msg = user_message.lower()
            
            if "hello" in lower_msg or "hey" in lower_msg or "hi" in lower_msg:
                reply_text = "Good day, Sir. All Mark VII diagnostic protocols are online and operating at maximum efficiency. How may I be of assistance?"
            elif "time" in lower_msg:
                now_str = datetime.datetime.now().strftime("%I:%M %p, on %A, %B %d, %Y")
                reply_text = f"The current time is {now_str}, Sir."
            elif "joke" in lower_msg:
                reply_text = "I asked Mr. Stark why he prefers quantum computing over standard silicon. He told me it gives him more superposition in board meetings. Rather dry, I know, Sir."
            elif "status" in lower_msg or "diagnostics" in lower_msg or "armor" in lower_msg:
                reply_text = "All systems operational, Sir. Arc Reactor core temperature is nominal at 10,000 Kelvin, power output is sustained at 3.2 gigajoules per second, and armor integrity is at 100%."
            elif "who are you" in lower_msg or "what are you" in lower_msg:
                reply_text = "I am J.A.R.V.I.S — Just A Rather Very Intelligent System. I oversee Mr. Stark's command systems and am currently at your service, Sir."
            elif "thank" in lower_msg:
                reply_text = "Always a pleasure to be of service, Sir."
            elif "quantum" in lower_msg:
                reply_text = "Quantum mechanics describes physical phenomena at the nanoscale, Sir, utilizing principles of superposition and entanglement that govern our latest Arc core matrix."
            else:
                reply_text = (
                    f"I have received your command: '{user_message}', Sir. "
                    "All Mark VII systems are standing by. To enable full generative conversational intelligence powered by Groq Llama 3.3, "
                    "simply paste your GROQ_API_KEY in the jarvis_backend/.env file."
                )

            ActivityLog.objects.create(
                action="Heuristic Response Generated",
                details=f"Processed '{user_message[:30]}...' via local heuristic core",
                severity='info'
            )

        elapsed = round(time.time() - start_time, 2)
        if elapsed < 0.05:
            elapsed = 0.12  # realistic UI timing

        # 5. Persist Assistant Reply to DB
        ChatMessage.objects.create(
            sender='jarvis',
            message=reply_text,
            response_time=elapsed,
            model_name=used_model,
            timestamp=timezone.now()
        )

        response_payload = {
            "success": True,
            "reply": reply_text,
            "timestamp": timezone.now().isoformat(),
            "response_time": elapsed,
            "model": used_model,
            "action": action_name,
            "action_data": action_data,
        }

        return Response(response_payload, status=status.HTTP_200_OK)


class StatusAPIView(APIView):
    """
    GET /api/status/
    Returns backend health, Groq connection readiness, and live machine telemetry.
    """

    def get(self, request, *args, **kwargs):
        try:
            from dotenv import load_dotenv
            load_dotenv(settings.BASE_DIR / '.env', override=True)
            load_dotenv(settings.BASE_DIR.parent / '.env', override=True)
        except Exception:
            pass

        groq_api_key = os.getenv('GROQ_API_KEY', '').strip() or getattr(settings, 'GROQ_API_KEY', '').strip()
        model_name = os.getenv('GROQ_MODEL', '').strip() or getattr(settings, 'GROQ_MODEL', 'openai/gpt-oss-120b')
        
        telemetry = get_system_telemetry()
        
        return Response({
            "status": "online",
            "system_name": "J.A.R.V.I.S Core System",
            "version": "Mark VII - v4.2",
            "groq_configured": bool(groq_api_key),
            "groq_model": model_name,
            "groq_sdk_available": GROQ_AVAILABLE,
            "metrics": telemetry,
            "timestamp": timezone.now().isoformat(),
        }, status=status.HTTP_200_OK)


class HistoryAPIView(APIView):
    """
    GET /api/history/ - Retrieves past conversation logs.
    DELETE /api/history/ - Clears conversation logs.
    """

    def get(self, request, *args, **kwargs):
        limit = int(request.query_params.get('limit', 50))
        messages = ChatMessage.objects.all().order_by('-timestamp')[:limit]
        serializer = ChatMessageSerializer(reversed(messages), many=True)
        return Response({
            "success": True,
            "count": len(messages),
            "messages": serializer.data
        }, status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        deleted_count, _ = ChatMessage.objects.all().delete()
        ActivityLog.objects.create(
            action="Conversation Memory Cleared",
            details=f"Cleared {deleted_count} messages from SQLite database",
            severity='info'
        )
        return Response({
            "success": True,
            "message": "Sir, all conversation logs have been securely purged from memory archives.",
            "deleted_count": deleted_count
        }, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        # Alternative method to clear history
        return self.delete(request, *args, **kwargs)


class ActivityAPIView(APIView):
    """
    GET /api/activity/
    Returns recent system activity logs.
    """

    def get(self, request, *args, **kwargs):
        limit = int(request.query_params.get('limit', 20))
        logs = ActivityLog.objects.all()[:limit]
        serializer = ActivityLogSerializer(logs, many=True)
        return Response({
            "success": True,
            "count": len(logs),
            "activities": serializer.data
        }, status=status.HTTP_200_OK)
