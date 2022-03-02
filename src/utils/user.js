const users = [];

const addUser = ({id, username, room})=>{
    room = room.trim().toLowerCase()
    username = username.trim().toLowerCase()
    username = username.charAt(0).toUpperCase() + username.slice(1) 

    if(!username || !room){
        return{
            error: "Username and romm should be provided."
        }
    }

    //check for existing user
    const existingUser = users.find(user=>user.room === room && user.username === username);

    //Validate user
    if(existingUser){
        return{
            error:"Username should be unique!"
        }
    }

    //Store user
    const user = {id, username, room}
    users.push(user)
    return {
        user
    }

}
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) {
    return {
      error: "User does not exists",
    };
  }
  return users.splice(index, 1)[0];

  // const updatedUsers = users.filter((user) => user.id !== id);
  // return updatedUsers;
};

const getUser = (id)=>{
    return users.find(user=> user.id === id);
}


const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}