import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe('ShowUserProfile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it('should be able to show an user profile', async () => {
    const createdUser = await inMemoryUsersRepository.create({
      name: 'Test user',
      email: 'test@email.com',
      password: '123456',
    });

    const user = await showUserProfileUseCase.execute(createdUser.id);

    expect(user).toHaveProperty('id');
    expect(user.id).toBe(createdUser.id);
    expect(user.name).toBe(createdUser.name);
    expect(user.email).toBe(createdUser.email);
  });

  it('should not be able to show nonexistent user', async () => {
    await expect(
      showUserProfileUseCase.execute('9999')
    ).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
