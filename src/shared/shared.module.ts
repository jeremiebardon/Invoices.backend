import { Module } from '@nestjs/common';
import { ErrorsService } from './errors/errors.service';

@Module({
  providers: [ErrorsService],
})
export class SharedModule {}
