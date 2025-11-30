import app from './app';
import config from './config/config';
import { AppDataSource } from './config/data-source';
import { User } from './entities/User';

// test creating a user >>
// async function createUser() {
//   const userRepo = AppDataSource.getRepository(User);

//   const user = userRepo.create({
//     email: "test@example.com",
//     password: "123456",
//   });

//   await userRepo.save(user);
//   console.log("User created:", user);
// }

// AppDataSource.initialize()
//   .then(createUser)
//   .catch(console.error);

import testRoutes from './routes/test.routes';
app.use('/api/test', testRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log('Database connected!');

    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to database:', err);
  });
