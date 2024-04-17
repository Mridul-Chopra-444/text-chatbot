import os
import sys
import constants

import openai
from langchain.chains import ConversationalRetrievalChain, RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain.document_loaders import DirectoryLoader, TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain.indexes import VectorstoreIndexCreator
from langchain.indexes.vectorstore import VectorStoreIndexWrapper
from langchain_openai import OpenAI
from langchain.vectorstores import Chroma

from flask import Flask, request,  render_template


os.environ["OPENAI_API_KEY"] = constants.APIKEY

# Enable to save to disk & reuse the model (for repeated queries on the same data)
PERSIST = False

query = None
if len(sys.argv) > 1:
  query = sys.argv[1]

if PERSIST and os.path.exists("persist"):
  print("Reusing index...\n")
  vectorstore = Chroma(persist_directory="persist", embedding_function=OpenAIEmbeddings())
  index = VectorStoreIndexWrapper(vectorstore=vectorstore)
else:
  #loader = TextLoader("data/data.txt") # Use this line if you only need data.txt
  loader = DirectoryLoader("data/")
  if PERSIST:
    index = VectorstoreIndexCreator(vectorstore_kwargs={"persist_directory":"persist"}).from_loaders([loader])
  else:
    index = VectorstoreIndexCreator().from_loaders([loader])

chain = ConversationalRetrievalChain.from_llm(
  llm=ChatOpenAI(model="gpt-3.5-turbo"),
  retriever=index.vectorstore.as_retriever(search_kwargs={"k": 1}),
)

# Create a Flask application instance
app = Flask(__name__)
chat_history = []


# while True:
#   if not query:
#     query = input("Prompt: ")
#   if query in ['quit', 'q', 'exit']:
#     sys.exit()
#   result = chain({"question": query, "chat_history": chat_history})
#   print(result['answer'])

#   chat_history.append((query, result['answer']))
#   query = None


@app.route('/chatbot')
def index():
    return render_template("index.html")

@app.route('/api/chatbot', methods=['POST'])
def chatbot_rest():
    try:
        data = request.json
        prompt = data['prompt']
        result = chain({"question": prompt, "chat_history": chat_history})
        chat_history.append((prompt, result['answer']))
        return {'result': result['answer']}
    except KeyError as e:
        # Handle KeyError (e.g., if 'prompt' key is missing in the request JSON)
        return {'result': 'KeyError: {}'.format(e)}
    except Exception as e:
        # Handle other exceptions
        return {'result': 'An error occurred: {}'.format(e)}
    
# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True)