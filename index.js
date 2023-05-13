const { Configuration, OpenAIApi } = require("openai");
const readline = require("readline");
const { program } = require("commander");

program
  .name("chatgpt-cmd")
  .usage("[options]")
  .option("-key, --openAiKey <secret>", "open ai api key");

program.parse(process.argv);

const options = program.opts();

const key = options.OpenAiKey || "";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const configuration = new Configuration({
  apiKey: process.env["openai-key"],
});
const openai = new OpenAIApi(configuration);

let conversation = [];

async function connectToChatGpt(messages) {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
    });
    const response = completion.data.choices;
    const newConversation = [...conversation, response[0].message];
    conversation = newConversation;
    console.log(response[0].message.content);
  } catch (err) {
    console.log("something went wrong");
    console.log(err.response);
  }
}

function startChat(old = false) {
  const newMessage = old ? "Type new message: " : "Lets chat: ";
  rl.question(newMessage, async (msg) => {
    conversation.push({ role: "user", content: msg });
    connectToChatGpt(conversation)
      .then(() => {
        rl.question("Do you want to continue? (yes/no) ", (answer) => {
          if (answer.toLowerCase() === "yes") {
            startChat(true);
          } else {
            rl.close();
          }
        });
      })
      .catch((err) => console.log(err));
  });
}

if (key) {
  startChat(false);
} else {
  console.log("please enter the key");
}
