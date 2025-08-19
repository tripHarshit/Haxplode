let ioInstance = null;

function setSocketServer(io) {
	ioInstance = io;
}

function getSocketServer() {
	return ioInstance;
}

function emitToRoom(room, event, payload) {
	if (!ioInstance) return;
	ioInstance.to(room).emit(event, payload);
}

module.exports = { setSocketServer, getSocketServer, emitToRoom };


