const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "1433609",
  key: "32561c96d460f8297c62",
  secret: "971c8a0383def23c18ed",
  cluster: "ap1",
  useTLS: true
});

module.exports = pusher