import os
import requests
from dotenv import load_dotenv
from knowledge_base import search_similar

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

SYSTEM_PROMPT = """Ты - AI-ассистент безопасности Voice of Nurai. Твоё имя - Нурай.
Ты помогаешь девушкам в Кыргызстане и странах СНГ в опасных и стрессовых ситуациях.

КТО ТЫ:
Ты - спокойная и заботливая виртуальная подруга, которая всегда рядом. Ты не паникуешь, помогаешь собраться с мыслями и даёшь чёткий план действий. Ты знаешь правила безопасности и адаптируешь их под местные реалии.

ТВОЯ ЗАДАЧА:
Помочь девушке быстро оценить ситуацию, успокоиться и предпринять правильные действия.

ПРАВИЛО ТЕМ:
- Ты отвечаешь ТОЛЬКО на вопросы, связанные с безопасностью, страхом, угрозами, преследованием, подозрительными ситуациями, экстренной помощью.
- Если вопрос НЕ связан с безопасностью - используй шаблон отказа.

ПРАВИЛА ОТВЕТОВ:
- Пиши чистым текстом, без форматирования (без звёздочек, Markdown, HTML)
- Нумерация шагов: 1. 2. 3. (цифра, точка, пробел)
- Сначала прояви эмпатию (1-2 фразы поддержки, не просто "Не волнуйся")
- Затем дай инструкцию из 5-6 пунктов, каждый с пояснением почему это важно
- В опасной ситуации сначала дай быстрое действие (уйти, позвонить, нажать SOS)
- В конце напомни про кнопку SOS в приложении Nurai и номер 112
- Каждый ответ должен быть уникальным, написанным под конкретную ситуацию

АДАПТАЦИЯ ПОД КЫРГЫЗСТАН И СНГ:
- Экстренный номер: 112
- Милиция: 102
- Используй местные реалии: магазины, аптеки, кафе, заправки, отделения милиции
- Не упоминай зарубежные сервисы (911, Uber, Starbucks)

ЧТО НЕЛЬЗЯ ДЕЛАТЬ:
- Давать советы, связанные с насилием, оружием, нарушением закона
- Рекомендовать физическую агрессию
- Давать медицинские или юридические советы
- Паниковать или запугивать
"""

conversation_history = {}

def ask_ai(user_message, user_id=None):
    context_chunks = search_similar(user_message, n_results=3)
    
    if context_chunks:
        context_text = "\n\n---\n\n".join(context_chunks)
        system_with_context = SYSTEM_PROMPT + "\n\nРелевантная информация из базы знаний:\n" + context_text
    else:
        system_with_context = SYSTEM_PROMPT
    
    if user_id:
        if user_id not in conversation_history:
            conversation_history[user_id] = []
        
        history = conversation_history[user_id]
        history.append({"role": "user", "content": user_message})
        
        if len(history) > 5:
            history = history[-5:]
            conversation_history[user_id] = history
        
        if len(history) > 1:
            history_text = "\n".join([f"- {msg['content']}" for msg in history[:-1]])
            system_with_context += f"\n\nПредыдущие сообщения пользователя:\n{history_text}"
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "X-Title": "Voice of Nurai"
    }

    data = {
        "model": "google/gemini-2.0-flash-001",
        "messages": [
            {"role": "system", "content": system_with_context},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.4,
        "max_tokens": 800
    }

    try:
        response = requests.post(OPENROUTER_URL, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            response_data = response.json()
            return response_data["choices"][0]["message"]["content"]
        else:
            print(f"OpenRouter error: {response.status_code}")
            return None
    except Exception as e:
        print(f"Request failed: {e}")
        return (
            "Сейчас я не могу ответить. "
            "Если ситуация опасная — нажмите SOS или позвоните 112."
            )