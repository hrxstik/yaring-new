import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseConfig } from '@app/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { EntityRecord } from './entities/entity.entity';
import { ContentPageRecord } from './entities/content-page.entity';

const catalogEntities = [EntityRecord, ContentPageRecord];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(
      createDatabaseConfig(
        process.env.CATALOG_DB_URL ?? 'postgresql://yaring:yaring_secret@localhost:5432/catalog_db',
        catalogEntities,
      ),
    ),
    TypeOrmModule.forFeature([EntityRecord, ContentPageRecord]),
  ],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
