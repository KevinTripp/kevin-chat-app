const users = []

const addUser = ({ id, username, room}) =>{
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if(!username || !room ){
        return {
            error: 'Username and room are required!'
        }
    }

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if (existingUser){
        return {
            error:'Username is in use!'
        }
    }

    //store user
    const user = {id, username, room}
    users.push(user)
    return { user}

}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1){
        return users.splice(index, 1)[0]
    }

}

const getUser = (id) => {
    const index = users.findIndex((user) =>  user.id === id)

    if(index !== -1){
        return users[index]
    }else{
        return undefined
    }

}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    const usersInRoom = []
    users.forEach((user) => {
       if(user.room === room){
           usersInRoom.push(user)
       }
    })

    if(usersInRoom.length !== 0){
        return usersInRoom
    }else{
        return {
            error : "No users found"
        }
    }


}

module.exports={
    addUser,
    removeUser,
    getUsersInRoom,
   getUser 
}

