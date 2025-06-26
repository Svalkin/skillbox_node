const {nanoid} = require("nanoid");
const {hash} = require("./hash");

const DB = {
  users: [
    // {
    //   _id: nanoid(),
    //   username: "admin",
    //   password: hash("pwd007"),
    // },
  ],
  sessions: {},
  timers: {},
};

exports.createUser = async (username, password) => {
  const user = DB.users.find((el) => el.username === username);
  if (user) {
    return false;
  } else {
    const newUser = {
      _id: nanoid(),
      username,
      password: await hash(password),
    };
    DB.users.push(newUser);
    return newUser;
  }
};

exports.findByUserName = (username) => {
  return DB.users.find((el) => el.username === username);
};

exports.findBySession = (session) => {
  const userId = DB.sessions[session];
  if (!userId) {
    return;
  }
  return DB.users.find((el) => el._id === userId);
};

exports.createSession = (userId) => {
  const session = nanoid();
  DB.sessions[session] = userId;
  return session;
};

exports.deleteSession = (session) => {
  delete DB.sessions[session];
};

exports.getTimers = (userid, active) => {
  if (DB.timers[userid]) {
    return DB.timers[userid]
      .filter((el) => el.isActive === active)
      .map((el) => {
        if (el.isActive) {
          el.progress = Date.now() - el.start;
        }
        return el;
      });
  }
  return [];
};

exports.createTimer = (userId, description) => {
  const id = nanoid();
  const timer = {
    start: Date.now(),
    description,
    isActive: true,
    id,
  };

  if (!DB.timers[userId]) {
    DB.timers[userId] = [];
  }

  DB.timers[userId].push(timer);
  return id;
};

exports.stopTimer = (userId, timerId) => {
  const index = DB.timers[userId].findIndex(el => el.id === timerId)
  if (index !== -1) {
    const stoppedTimer = {...DB.timers[userId][index]}
    delete stoppedTimer.progress
    stoppedTimer.end = Date.now();
    stoppedTimer.duration = stoppedTimer.end - stoppedTimer.start;
    stoppedTimer.isActive = false;
    DB.timers[userId][index] = stoppedTimer;
    return true;
  }
  return false;
};
