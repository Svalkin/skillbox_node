const express = require("express");
const router = express.Router();
const {getTimers, createTimer, stopTimer} = require("../utils/db");
const {isAuth} = require("../middleware/auth");

router.get("/", isAuth(), async (req, res) => {
  if (!req.user) return res.sendStatus(401);

  let {isActive} = req.query;
  isActive = isActive === 'true';

  let timers = getTimers(req.user._id, isActive);
  if (timers.length > 0) {
    return res.status(200).json(timers);
  }
  return res.status(204).end();
});

router.post("/", isAuth(), (req, res) => {
  if (!req.user) return res.sendStatus(401);

  const {description} = req.body;
  const id = createTimer(req.user._id, description);
  return res.status(201).json({id});
});

router.post("/:id/stop", isAuth(), (req, res) => {
  if (!req.user) return res.sendStatus(401);

  const id = req.params.id;
  const isDelete = stopTimer(req.user._id, id);
  if (isDelete) {
    return res.status(200).json({id});
  }
  return res.status(400).json({id, error: 'Timer not found'});
});

module.exports = router;
