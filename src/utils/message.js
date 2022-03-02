const generateMessages = (username, text) => {
  return {
    text,
    username,
    createdAt: new Date().getTime(),
  };
};

const generateLocationMessage = (username, url)=>{
    return{
        url,
        username,
        createdAt: new Date().getTime()
    }
}
module.exports = { generateMessages, generateLocationMessage };