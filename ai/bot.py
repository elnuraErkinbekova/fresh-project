import os
from dotenv import load_dotenv
from telegram import Update, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    filters
)
from ai_assistant import ask_ai
from knowledge_base import load_articles_from_folder, get_db_stats

load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")


def get_emergency_keyboard():
    """Экстренная клавиатура с быстрыми действиями"""
    keyboard = [
        [KeyboardButton("🚨 SOS ЭКСТРЕННАЯ ПОМОЩЬ")],
        [KeyboardButton("🏃‍♀️ ЗА МНОЙ ГОНЯТСЯ")],
        [KeyboardButton("👊 НА МЕНЯ НАПАДАЮТ")],
        [KeyboardButton("🚕 СТРАННЫЙ ВОДИТЕЛЬ")],
        [KeyboardButton("🏠 НЕ МОГУ ПОПАСТЬ ДОМОЙ")],
        [KeyboardButton("👤 КТО-ТО СЛЕДИТ")],
        [KeyboardButton("🆘 ПОМОЩЬ РЯДОМ")]
    ]
    return ReplyKeyboardMarkup(keyboard, resize_keyboard=True)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🛡️ Voice of Nurai - AI Safety Assistant\n\n"
        "Я помогаю девушкам в опасных ситуациях.\n\n"
        "- Опишите ситуацию словами\n"
        "- Или нажмите одну из кнопок ниже\n\n"
        "🚨 Если нужна срочная помощь - нажмите SOS",
        reply_markup=get_emergency_keyboard()
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🛡️ Voice of Nurai - Что я умею:\n\n"
        "1. Напишите о ситуации - я дам совет\n"
        "2. Используйте кнопки для быстрого ответа\n"
        "3. Нажмите SOS для экстренной инструкции\n\n"
        "📞 В критической ситуации: кнопка SOS в приложении Nurai или звонок 112",
        reply_markup=get_emergency_keyboard()
    )


async def sos_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🚨 ЭКСТРЕННАЯ ИНСТРУКЦИЯ:\n\n"
        "1. СОХРАНЯЙТЕ СПОКОЙСТВИЕ\n"
        "2. НАЖМИТЕ SOS-КНОПКУ в приложении Nurai\n"
        "3. ЗАЙДИТЕ в ближайший магазин, аптеку или кафе\n"
        "4. ЗВОНИТЕ 112\n"
        "5. ПЕРЕЙДИТЕ на освещённую сторону улицы\n"
        "6. ЖДИТЕ ПОМОЩЬ в безопасном месте",
        reply_markup=get_emergency_keyboard()
    )


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_message = update.message.text
    print(f"User message: {user_message}")
    await update.message.chat.send_action(action="typing")
    
    if user_message == "🚨 SOS ЭКСТРЕННАЯ ПОМОЩЬ":
        await sos_command(update, context)
        return
    
    elif user_message == "🏃‍♀️ ЗА МНОЙ ГОНЯТСЯ":
        answer = """🚨 Вас преследуют. Постарайтесь действовать быстро и спокойно:

1. КРИЧИТЕ! Громко кричите "ПОЖАР!" или "ПОМОГИТЕ!"

2. БЕГИТЕ в ближайшее людное место: магазин, аптека, кафе

3. ЗВОНИТЕ 112 прямо во время бега

4. НАЖМИТЕ SOS в приложении Nurai

НЕ ОСТАНАВЛИВАЙТЕСЬ! Бегите, пока не окажетесь в безопасности"""
        await update.message.reply_text(answer, reply_markup=get_emergency_keyboard())
        return
    
    elif user_message == "👊 НА МЕНЯ НАПАДАЮТ":
        answer = """🚨 НАПАДЕНИЕ! НЕМЕДЛЕННЫЕ ДЕЙСТВИЯ:

1. КРИЧИТЕ изо всех сил

2. ЗАЩИЩАЙТЕ уязвимые места: глаза, нос

3. ИСПОЛЬЗУЙТЕ подручные предметы: ключи, телефон, сумку

4. БЕГИТЕ при первой возможности

5. ЗВОНИТЕ 112

Жизнь важнее вещей!"""
        await update.message.reply_text(answer, reply_markup=get_emergency_keyboard())
        return
    
    elif user_message == "🚕 СТРАННЫЙ ВОДИТЕЛЬ":
        answer = """⚠️ Если водитель такси ведёт себя странно:

1. ПОПРОСИТЕ остановить в людном месте

2. ВЫХОДИТЕ сразу же

3. ЗАПОМНИТЕ номер машины

4. ПОЗВОНИТЕ доверенному человеку и скажите, где выходите

5. ПОСЛЕ - сообщите в такси-агрегатор и позвоните 102"""
        await update.message.reply_text(answer, reply_markup=get_emergency_keyboard())
        return
    
    elif user_message == "🏠 НЕ МОГУ ПОПАСТЬ ДОМОЙ":
        answer = """⚠️ Что делать, если не можете попасть домой ночью:

1. ПОЗВОНИТЕ подруге или родственнику

2. ПОПРОСИТЕ консьержа или охранника проводить

3. ВЫЗОВИТЕ такси до дома подруги или гостиницы

4. ПОСЛЕДНИЙ ВАРИАНТ - вызовите полицию 102

Не заходите в тёмный подъезд одна!"""
        await update.message.reply_text(answer, reply_markup=get_emergency_keyboard())
        return
    
    elif user_message == "👤 КТО-ТО СЛЕДИТ":
        answer = """⚠️ Если вы заметили, что кто-то следит:

1. ПРОВЕРЬТЕ - перейдите на другую сторону улицы

2. НЕ ИДИТЕ ДОМОЙ - идите в людное место

3. ЗАЙДИТЕ в магазин или кафе и позвоните 112

4. НАЗОВИТЕ приметы человека

5. ВКЛЮЧИТЕ live-локацию в приложении Nurai"""
        await update.message.reply_text(answer, reply_markup=get_emergency_keyboard())
        return
    
    elif user_message == "🆘 ПОМОЩЬ РЯДОМ":
        answer = ask_ai("мне нужна помощь, где найти безопасное место рядом", user_id=str(update.effective_user.id))
    else:
        answer = ask_ai(user_message, user_id=str(update.effective_user.id))
    
    if answer:
        await update.message.reply_text(answer, reply_markup=get_emergency_keyboard())
        print("AI response sent")
    else:
        await update.message.reply_text(
            "❌ Произошла ошибка. Пожалуйста, нажмите SOS-кнопку в приложении Nurai или позвоните 112.",
            reply_markup=get_emergency_keyboard()
        )


app = ApplicationBuilder().token(TELEGRAM_TOKEN).build()

app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("help", help_command))
app.add_handler(CommandHandler("sos", sos_command))
app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

print("Voice of Nurai AI Bot is running...")

stats = get_db_stats()
if stats["total_chunks"] == 0:
    print("Loading articles into ChromaDB (first start, may take a minute)...")
    load_articles_from_folder()
    print("Database ready.")
    
app.run_polling()