const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {getUsersInRoom, addUser, getUser, removeUser} = require('./utils/users')

const port = process.env.PORT || 3000
// const publicDirectoryPath = path.join(__dirname, '../public')

const app = express()
const server = http.createServer(app)
const io = socketio(server)


const publicDirectoryPath = path.join (__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection', ( socket) =>{
    console.log('New WebSocket connection')

    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({id:socket.id, username, room})
        if(error){
            return callback(error) 
        }

        socket.join(user.room)

        socket.emit('message', generateMessage( 'Welcome!', 'admin'))
        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} joined!`) )
        io.to(user.room).emit('roomData', {
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        
        callback()
    })

    socket.on('sendMessage', ({messageText, username, room}, callback) =>{
        const user = getUser(socket.id)
        console.log(user)
        const filter = new Filter()

        if(filter.isProfane(messageText)){
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(messageText, user.username))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage('admin',`A ${user.username} has left ${user.room}`))
            io.to(user.room).emit('roomData', {
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (positions,user, callback) =>{
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps/?q=${positions.latitude},${positions.longitude}`))
        callback()
    })
})



app.get('/', function(req, res){
    res.sendFile('index.html')
})

server.listen(port, () => {
    console.log('service is up on port ' + port)
})
