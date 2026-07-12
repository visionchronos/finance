import { prisma } from "./src/lib/prisma";

async function test() {
  try {
    const users = await prisma.user.findMany();
    console.log(users);
  } catch (e) {
    console.error(e);
  }
}
test();
