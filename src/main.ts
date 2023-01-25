#!/usr/bin/env npx ts-node-esm --files

import { AppDataSource } from "./data-source.js";
import { User } from "./entity/User.js";

try {
  await AppDataSource.initialize();

  console.log("Inserting a new user into the database...");
  const user = new User();
  user.firstName = "Timber";
  user.lastName = "Saw";
  user.age = 25;
  await user.save();
  console.log("Saved a new user with id: " + user.id);

  console.log("Loading users from the database...");
  const users = await User.find();
  console.log("Loaded users: ", users);

  const usersToDelete = await User.find({ take: 1 });
  await usersToDelete[0].remove();

  console.log("Here you can setup and run express / fastify / any other framework.");
} catch (error) {
  console.log(error);
}

await AppDataSource.destroy();
