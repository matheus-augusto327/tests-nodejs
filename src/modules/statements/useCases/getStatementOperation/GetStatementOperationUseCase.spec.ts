import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let getStatementOperation: GetStatementOperationUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('GetStatementOperation', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    getStatementOperation = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  it("should be able to get a user's statement by id", async () => {
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

    const userStatement = await getStatementOperation.execute({
      user_id: user.id,
      statement_id: statement.id,
    });

    expect(userStatement).toMatchObject(statement);
  });

  it('should not be able to get the statement of a nonexistent user', async () => {
    await expect(getStatementOperation.execute({
      user_id: '9999',
      statement_id: '999',
    })).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get a user's nonexistent statement", async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Test user',
      email: 'test@email.com',
      password: '123456',
    });

    await expect(getStatementOperation.execute({
      user_id: user.id,
      statement_id: '999',
    })).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
