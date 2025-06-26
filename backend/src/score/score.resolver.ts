import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ScoreService } from './score.service';
import { Score } from './entities/score.entity';
import { CreateScoreInput } from './dto/create-score.input';
import { UpdateScoreInput } from './dto/update-score.input';

@Resolver(() => Score)
export class ScoreResolver {
  constructor(private readonly scoreService: ScoreService) {}

  @Mutation(() => Score)
  createScore(@Args('createScoreInput') createScoreInput: CreateScoreInput) {
    return this.scoreService.create(createScoreInput);
  }

  @Query(() => [Score], { name: 'score' })
  findAll() {
    return this.scoreService.findAll();
  }

  @Query(() => Score, { name: 'score' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.scoreService.findOne(id);
  }

  @Mutation(() => Score)
  updateScore(@Args('updateScoreInput') updateScoreInput: UpdateScoreInput) {
    return this.scoreService.update(updateScoreInput.id, updateScoreInput);
  }

  @Mutation(() => Score)
  removeScore(@Args('id', { type: () => Int }) id: number) {
    return this.scoreService.remove(id);
  }
}
