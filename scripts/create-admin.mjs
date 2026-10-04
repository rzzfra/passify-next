import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const prompt = createInterface({ input: stdin, output: stdout });

function readHidden(label) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
    return Promise.reject(
      new Error("Run this command from an interactive terminal."),
    );
  }

  return new Promise((resolve, reject) => {
    let value = "";
    stdout.write(label);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    const finish = (error) => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
      stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    };

    const onData = (character) => {
      if (character === "\u0003") {
        finish(new Error("Cancelled."));
      } else if (character === "\r" || character === "\n") {
        finish();
      } else if (character === "\u007f" || character === "\b") {
        if (value.length > 0) {
          value = value.slice(0, -1);
          stdout.write("\b \b");
        }
      } else if (character >= " ") {
        value += character;
        stdout.write("*");
      }
    };

    stdin.on("data", onData);
  });
}

try {
  const username = (await prompt.question("Admin username: "))
    .trim()
    .toLowerCase();
  const name = (await prompt.question("Display name: ")).trim();
  const password = await readHidden("Password (min. 12 characters): ");

  if (!username || !name || password.trim().length < 12) {
    throw new Error(
      "Username and display name are required; password must be at least 12 characters.",
    );
  }

  const existing = await prisma.adminUser.findUnique({ where: { username } });
  if (existing)
    throw new Error(`An admin with username "${username}" already exists.`);

  await prisma.adminUser.create({
    data: {
      username,
      name,
      password: await bcrypt.hash(password.trim(), 10),
      createdAt: BigInt(Date.now()),
    },
  });

  console.log(`Admin "${username}" created successfully.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  prompt.close();
  await prisma.$disconnect();
}
