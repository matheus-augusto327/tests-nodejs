import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe('CreateUser', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to create a new user', async () => {
    const user = {
      name: 'Test user',
      email: 'test@email.com',
      password: '123456',
    };

    const createdUser = await createUserUseCase.execute(user);

    expect(createdUser).toHaveProperty('id');
    expect(createdUser.name).toBe(user.name);
    expect(createdUser.email).toBe(user.email);
  });

  it('should not be able to create a duplicated user', async () => {
    const user = await createUserUseCase.execute({
      name: 'Test user',
      email: 'test@email.com',
      password: '123456',
    });

    expect(user).toHaveProperty('id');

    await expect(
      createUserUseCase.execute({
        name: 'Test user',
        email: 'test@email.com',
        password: '123456',
      })
    ).rejects.toBeInstanceOf(CreateUserError);
  });
});
