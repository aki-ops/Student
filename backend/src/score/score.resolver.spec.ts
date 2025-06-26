import { Test, TestingModule } from '@nestjs/testing';
import { ScoreResolver } from './score.resolver';
import { ScoreService } from './score.service';

describe('ScoreResolver', () => {
  let resolver: ScoreResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScoreResolver, ScoreService],
    }).compile();

    resolver = module.get<ScoreResolver>(ScoreResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
