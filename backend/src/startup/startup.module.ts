import { Module, Global } from '@nestjs/common';
import { StartupService } from './startup.service';

@Global()
@Module({
  providers: [StartupService],
  exports: [StartupService],
})
export class StartupModule {}
