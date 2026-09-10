import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export const initSocket = (server: HTTPServer, corsOrigin: string = '*'): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: corsOrigin === '*' ? true : corsOrigin,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join room for a specific Centre
    socket.on('join:centre', (centreId: string) => {
      socket.join(`centre:${centreId}`);
      console.log(`[Socket] ${socket.id} joined centre:${centreId}`);
    });

    // Join room for a specific Farmer
    socket.on('join:farmer', (farmerId: string) => {
      socket.join(`farmer:${farmerId}`);
      console.log(`[Socket] ${socket.id} joined farmer:${farmerId}`);
    });

    // Join room for a specific Booking/Token
    socket.on('join:booking', (bookingId: string) => {
      socket.join(`booking:${bookingId}`);
      console.log(`[Socket] ${socket.id} joined booking:${bookingId}`);
    });

    // Join room for Admin dashboard
    socket.on('join:admin', () => {
      socket.join('admin:dashboard');
      console.log(`[Socket] ${socket.id} joined admin:dashboard`);
    });

    // Cross-Portal Event Relays
    socket.on('payment:update', (data: any) => {
      socket.broadcast.emit('payment:update', data);
    });

    socket.on('queue:update', (data: any) => {
      socket.broadcast.emit('queue:update', data);
    });

    socket.on('sms:notification', (data: any) => {
      socket.broadcast.emit('sms:notification', data);
    });

    socket.on('msp:update', (data: any) => {
      socket.broadcast.emit('msp:update', data);
    });

    socket.on('gate:arrival', (data: any) => {
      socket.broadcast.emit('gate:arrival', data);
    });

    socket.on('booking:created', (data: any) => {
      socket.broadcast.emit('booking:created', data);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return io;
};
