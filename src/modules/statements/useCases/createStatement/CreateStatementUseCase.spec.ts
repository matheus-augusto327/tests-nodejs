import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('CreateStatement', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it('should be able to create a new deposit statement', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Test user',
      email: 'test@email.com',
      password: '123456',
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 500.00,
      description: 'Test deposit statement',
    });

    expect(statement).toHaveProperty('id');
    expect(statement.amount).toBe(500.00);
  });

  it('should be able to create a new withdrawal statement', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Test user',
      email: 'test@email.com',
      password: '123456',
    });

    await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 500.00,
      description: 'Test deposit statement',
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.WITHDRAW,
      amount: 50.00,
      description: 'Test withdrawal statement',
    });

    expect(statement).toHaveProperty('id');
    expect(statement.amount).toBe(50.00);
  });

  it('should not be able to create a new statement with nonexistent user', async () => {
    await expect(createStatementUseCase.execute({
      user_id: '9999',
      type: OperationType.WITHDRAW,
      amount: 100.00,
      description: 'Test withdrawal statement',
    })).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it('should not be able to create a new withdrawal statement if there is not enough money', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Test user',
      email: 'test@email.com',
      password: '123456',
    });

    await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 50.00,
      description: 'Test deposit statement',
    });

    await expect(createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.WITHDRAW,
      amount: 100.00,
      description: 'Test withdrawal statement',
    })).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
