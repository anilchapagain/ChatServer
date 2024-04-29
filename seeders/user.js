import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import { User } from "../models/user.js";
import { faker, simpleFaker } from "@faker-js/faker";
const createUser = async (numUsers) => {
  try {
    const usersPromise = [];
    for (let i = 0; i < numUsers; i++) {
      const tempUser = User.create({
        name: faker.person.fullName(),
        username: faker.internet.userName(),
        bio: faker.lorem.sentence(10),
        password: "password",
        avatar: {
          url: faker.image.avatar(),
          public_id: faker.system.fileName(),
        },
      });
      usersPromise.push(tempUser);
      
    }
    await Promise.all(usersPromise);
    console.log("userCreated", numUsers);
    process.exit(1);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

const createSingleChats = async(numChats) => {
try {
  const users = await User.find().select('_id');
  const chatsPromise = [];
  for(let i = 0;i<users.length;i++){
    for(let j = i ;j<users.length ; j++){
      chatsPromise.push(
        Chat.create({
          name: faker.lorem.words(2),
          members:[users[i],users[j]],
        })
      )
    }
  }
await Promise.all(chatsPromise);
console.log('CHats created successfully');
process.exit(1);
} catch (error) {
  console.log(error);
  process.exit(1);
}
}
const createGroupChats = async(numChats) => {
try {
  
  const users = await User.find().select('_id');
  const chatsPromise=[];
  for(let i = 0 ; i<numChats;i++){
    const numMembers = simpleFaker.number.int({min:3,max:users.length});
    const members = [];
    for (let i= 0; i< numMembers; i++){
      const randomIndex = Math.floor(Math.random( )*users.length );
      const randomUser = users[randomIndex];

      if(!members.includes(randomUser)){
        members.push(randomUser)
      }
    }
    const chat = Chat.create({
      groupChat: true,
      name: faker.lorem.words(1),
      members,
      creator:members[0]
    })
    chatsPromise.push(chat);
  }
  await Promise.all(chatsPromise);
  console.log( 'Group Chats Created Successfully')
  process.exit();
} catch (error) {
  console.log(error);
  process.exit(1);
}
};
const createMessages = async (numMessages) => {
  try {
      const users = await User.find().select("_id");
      const chats = await Chat.find().select('_id');

      const messagePromise = [];
      for(let i=0;i< numMessages; i++){
        const randomUser = users[Math.floor(Math.random( ) * users.length)];
        const randomChat = chats[Math.floor(Math.random( ) * chats.length)];

        messagePromise.push
        (
          Message.create({
          chat : randomChat,
          sender : randomUser,
          content: faker.lorem.sentence(),
          })
        );

      }


      await Promise.all(messagePromise);

      console.log('Message Created');
      process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1)
  }

}
// const createMessages = async (numMessages) => {
  
// }
// createUser(10);
export { createUser,createSingleChats,createGroupChats,createMessages };
