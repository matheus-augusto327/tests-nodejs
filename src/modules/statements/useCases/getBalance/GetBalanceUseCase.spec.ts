import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalance: GetBalanceUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('GetBalance', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    getBalance = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository,
    );
  });

  it("should be able to get a user's balance", async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Test user',
      email: 'test@email.com',
      password: '123456',
    });

    const statement = await inMemoryStatementsRepository.create({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 500.00,
      description: 'Test deposit statement',
    });

    const balance = await getBalance.execute({ user_id: user.id });

    expect(balance).toHaveProperty('statement');
    expect(balance).toHaveProperty('balance');
    expect(balance.statement.length).toBe(1);
    expect(balance.statement[0]).toMatchObject(statement);
    expect(balance.balance).toBe(500.00);
  });

  it('should not be able to get the balance of a nonexistent user', async () => {
    await expect(getBalance.execute({
      user_id: '9999',
    })).rejects.toBeInstanceOf(GetBalanceError);
  });
});
