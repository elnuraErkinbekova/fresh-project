import os
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

DATA_FOLDER = os.path.join(os.path.dirname(__file__), "data")
CHROMA_DB_FOLDER = "./chroma_db"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 100
TOP_K_RESULTS = 3

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    model_kwargs={"device": "cpu"}
)

vectorstore = None

def load_articles_from_folder(folder_path=DATA_FOLDER):
    global vectorstore

    if os.path.exists(CHROMA_DB_FOLDER) and os.listdir(CHROMA_DB_FOLDER):
        print(f"Loading existing database from {CHROMA_DB_FOLDER}...")
        vectorstore = Chroma(
            persist_directory=CHROMA_DB_FOLDER,
            embedding_function=embeddings
        )
        print(f"Loaded {vectorstore._collection.count()} chunks")
        return vectorstore._collection.count()

    if not os.path.exists(folder_path):
        print(f"Folder {folder_path} not found")
        return 0

    txt_files = [f for f in os.listdir(folder_path) if f.endswith(".txt")]
    if not txt_files:
        print(f"No .txt files in {folder_path}")
        return 0

    print(f"Found {len(txt_files)} articles. Loading...")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", "! ", "? ", " ", ""]
    )

    all_chunks = []

    for filename in txt_files:
        filepath = os.path.join(folder_path, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        if not content.strip():
            continue

        chunks = splitter.split_text(content)
        all_chunks.extend(chunks)
        print(f"  {filename}: {len(chunks)} chunks")

    print(f"Creating embeddings for {len(all_chunks)} chunks...")
    vectorstore = Chroma.from_texts(
        texts=all_chunks,
        embedding=embeddings,
        persist_directory=CHROMA_DB_FOLDER
    )

    print(f"Loaded {len(all_chunks)} chunks from {len(txt_files)} articles")
    return len(all_chunks)


def search_similar(query, n_results=TOP_K_RESULTS):
    global vectorstore
    if vectorstore is None:
        return []

    docs = vectorstore.similarity_search(query, k=n_results)
    return [doc.page_content for doc in docs]


def get_db_stats():
    txt_count = 0
    if os.path.exists(DATA_FOLDER):
        txt_count = len([f for f in os.listdir(DATA_FOLDER) if f.endswith(".txt")])
    return {
        "total_chunks": vectorstore._collection.count() if vectorstore else 0,
        "txt_files": txt_count
    }

def init_knowledge_base():
    global vectorstore
    if os.path.exists(CHROMA_DB_FOLDER) and os.listdir(CHROMA_DB_FOLDER):
        vectorstore = Chroma(
            persist_directory=CHROMA_DB_FOLDER,
            embedding_function=embeddings
        )
        print(f"Knowledge base loaded: {vectorstore._collection.count()} chunks")
    else:
        print("Knowledge base not found. Run: python knowledge_base.py")

init_knowledge_base()

if __name__ == "__main__":
    print("=" * 50)
    print("LOADING KNOWLEDGE BASE")
    print("=" * 50)

    count = load_articles_from_folder()

    if count > 0:
        print("\n" + "=" * 50)
        print("TEST SEARCH")
        print("=" * 50)

        test_queries = [
            "Что делать если преследуют",
            "Подозрительное такси",
            "Безопасный маршрут домой"
        ]

        for query in test_queries:
            print(f"\nQuery: {query}")
            results = search_similar(query)
            if results:
                for i, text in enumerate(results):
                    preview = text[:150].replace("\n", " ") + "..."
                    print(f"  Result {i+1}: {preview}")
            else:
                print("  No results found")