import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe('AuthenticateUser', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to authenticate user', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Test user',
      email: 'test@email.com',
      password: await hash('123456', 8),
    });

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: '123456',
    })

    expect(authenticatedUser).toHaveProperty('user');
    expect(authenticatedUser).toHaveProperty('token');
  });

  it('should not be able to authenticate inexistent user', async () => {
    await expect(authenticateUserUseCase.execute({
      email: 'some@email.com',
      password: '123456',
    })).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('should not be able to authenticate user with wrong password', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Test user',
      email: 'test@email.com',
      password: await hash('123456', 8),
    });

    await expect(authenticateUserUseCase.execute({
      email: user.email,
      password: '123',
    })).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
