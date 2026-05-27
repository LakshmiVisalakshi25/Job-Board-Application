import {
  useState,
  useRef,
  useEffect
} from "react";

function Chatbot() {

  // ===============================
  // STATES
  // ===============================
  const [message, setMessage] =
    useState("");

  const [chat, setChat] =
    useState([
      {
        type: "bot",
        text:
          "Hi 👋 I am your AI Career Assistant. Ask me anything about jobs, skills, interviews, coding, or career guidance.",
        time:
          new Date().toLocaleTimeString()
      }
    ]);

  const [loading, setLoading] =
    useState(false);

  const [open, setOpen] =
    useState(false);

  const chatEndRef =
    useRef(null);

  // ===============================
  // AUTO SCROLL
  // ===============================
  useEffect(() => {

    chatEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [chat]);

  // ===============================
  // SEND MESSAGE
  // ===============================
  const sendMessage =
    async () => {

      if (!message.trim())
        return;

      // USER MESSAGE
      const userMessage = {

        type: "user",

        text: message,

        time:
          new Date().toLocaleTimeString()

      };

      // ADD USER CHAT
      setChat((prev) => [

        ...prev,

        userMessage

      ]);

      setLoading(true);

      try {

        const res =
          await fetch(
            "http://localhost:5000/api/chatbot",
            {

              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                message
              })
            }
          );

        const data =
          await res.json();

        // BOT RESPONSE
        const botMessage = {

          type: "bot",

          text:
            data.reply ||
            "No response received.",

          jobs:
            data.jobs || [],

          time:
            new Date().toLocaleTimeString()

        };

        setChat((prev) => [

          ...prev,

          botMessage

        ]);

      } catch (err) {

        console.log(err);

        setChat((prev) => [

          ...prev,

          {

            type: "bot",

            text:
              "⚠️ AI error occurred while processing your request.",

            time:
              new Date().toLocaleTimeString()

          }

        ]);

      } finally {

        setLoading(false);

        setMessage("");
      }
    };

  // ===============================
  // ENTER KEY
  // ===============================
  const handleKeyDown =
    (e) => {

      if (e.key === "Enter") {

        sendMessage();
      }
    };

  // ===============================
  // CLEAR CHAT
  // ===============================
  const clearChat =
    () => {

      setChat([
        {

          type: "bot",

          text:
            "Chat cleared ✅ Ask me anything again.",

          time:
            new Date().toLocaleTimeString()

        }
      ]);
    };

  return (

    <div className="fixed bottom-4 right-4 z-50">

      {/* OPEN BUTTON */}
      {!open && (

        <button
          onClick={() =>
            setOpen(true)
          }
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-full shadow-2xl transition"
        >
          🤖 AI Assistant
        </button>

      )}

      {/* CHAT WINDOW */}
      {open && (

        <div className="w-96 h-[600px] bg-white dark:bg-gray-900 shadow-2xl rounded-2xl flex flex-col overflow-hidden border dark:border-gray-700 transition duration-300">

          {/* HEADER */}
          <div className="bg-blue-500 text-white p-4 flex justify-between items-center">

            <div>

              <h2 className="font-bold text-lg">

                AI Career Assistant 🤖

              </h2>

              <p className="text-sm opacity-90">

                Smart career guidance

              </p>

            </div>

            <div className="flex gap-2">

              {/* CLEAR */}
              <button
                onClick={clearChat}
                className="text-sm bg-white text-blue-500 px-2 py-1 rounded"
              >
                Clear
              </button>

              {/* CLOSE */}
              <button
                onClick={() =>
                  setOpen(false)
                }
                className="text-white text-xl"
              >
                ×
              </button>

            </div>

          </div>

          {/* CHAT AREA */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-800">

            {chat.map((c, i) => (

              <div
                key={i}
                className={`mb-4 flex ${
                  c.type === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    c.type === "user"

                      ? "bg-blue-500 text-white"

                      : "bg-white dark:bg-gray-700 dark:text-white shadow"
                  }`}
                >

                  {/* MESSAGE */}
                  <p className="text-sm whitespace-pre-wrap">

                    {c.text}

                  </p>

                  {/* JOBS */}
                  {c.jobs?.length > 0 && (

                    <div className="mt-3 space-y-2">

                      {c.jobs.map((job) => (

                        <div
                          key={job._id}
                          className="border dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-800"
                        >

                          <h3 className="font-semibold">

                            {job.title}

                          </h3>

                          <p className="text-sm text-gray-600 dark:text-gray-300">

                            {job.company}

                          </p>

                          <p className="text-sm text-gray-600 dark:text-gray-300">

                            {job.location}

                          </p>

                          <p className="text-sm text-green-600 font-semibold">

                            ₹{job.salary}

                          </p>

                          <p className="text-xs mt-1">

                            {job.type}

                          </p>

                          {/* SKILLS */}
                          <div className="flex flex-wrap gap-1 mt-2">

                            {job.skills?.map(
                              (skill, idx) => (

                                <span
                                  key={idx}
                                  className="bg-gray-200 dark:bg-gray-600 text-xs px-2 py-1 rounded"
                                >
                                  {skill}
                                </span>

                              )
                            )}

                          </div>

                        </div>

                      ))}

                    </div>

                  )}

                  {/* TIME */}
                  <p className="text-[10px] mt-2 opacity-60">

                    {c.time}

                  </p>

                </div>

              </div>

            ))}

            {/* LOADING */}
            {loading && (

              <div className="flex justify-start mb-4">

                <div className="bg-white dark:bg-gray-700 dark:text-white shadow px-4 py-2 rounded-xl">

                  <p className="text-sm animate-pulse">

                    🤖 AI is thinking...

                  </p>

                </div>

              </div>

            )}

            <div ref={chatEndRef}></div>

          </div>

          {/* INPUT AREA */}
          <div className="p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-900 flex gap-2">

            <input
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 rounded-lg flex-1 outline-none"
              placeholder="Ask anything..."
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              Send
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Chatbot;