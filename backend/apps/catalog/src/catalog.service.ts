import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DEFAULT_CONTENT_PAGES } from '@app/common';
import { EntityRecord } from './entities/entity.entity';
import { ContentPageRecord } from './entities/content-page.entity';
import type { CreateEntityDto, UpdateEntityDto } from './catalog.dto';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(EntityRecord)
    private readonly entities: Repository<EntityRecord>,
    @InjectRepository(ContentPageRecord)
    private readonly pages: Repository<ContentPageRecord>,
  ) {
    void this.seed();
  }

  async listEntities(activeOnly = true) {
    const where = activeOnly ? { isActive: true } : {};
    const items = await this.entities.find({
      where,
      order: { name: 'ASC' },
    });
    return items.map((e) => this.toEntity(e));
  }

  async getEntity(id: string) {
    const item = await this.entities.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Объект не найден');
    return this.toEntity(item);
  }

  async getEntityBySlug(slug: string) {
    const item = await this.entities.findOne({ where: { slug } });
    if (!item) throw new NotFoundException('Объект не найден');
    return this.toEntity(item);
  }

  async createEntity(dto: CreateEntityDto) {
    const slug = dto.slug || this.slugify(dto.name);
    const existing = await this.entities.findOne({ where: { slug } });
    if (existing) throw new ConflictException('Slug уже занят');
    const item = this.entities.create({ ...dto, slug });
    await this.entities.save(item);
    return this.toEntity(item);
  }

  async updateEntity(id: string, dto: UpdateEntityDto) {
    const item = await this.entities.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Объект не найден');
    if (dto.slug && dto.slug !== item.slug) {
      const existing = await this.entities.findOne({ where: { slug: dto.slug } });
      if (existing) throw new ConflictException('Slug уже занят');
    }
    Object.assign(item, dto);
    if (dto.slug) item.slug = dto.slug;
    await this.entities.save(item);
    return this.toEntity(item);
  }

  async deleteEntity(id: string) {
    const item = await this.entities.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Объект не найден');
    await this.entities.remove(item);
    return { ok: true };
  }

  async getPage(slug: string) {
    const page = await this.pages.findOne({ where: { slug } });
    if (!page) throw new NotFoundException('Страница не найдена');
    return {
      slug: page.slug,
      title: page.title,
      body: page.body,
      updatedAt: page.updatedAt.toISOString(),
    };
  }

  async updatePage(slug: string, title: string, body: string) {
    let page = await this.pages.findOne({ where: { slug } });
    if (!page) {
      page = this.pages.create({ slug, title, body });
    } else {
      page.title = title;
      page.body = body;
    }
    await this.pages.save(page);
    return {
      slug: page.slug,
      title: page.title,
      body: page.body,
      updatedAt: page.updatedAt.toISOString(),
    };
  }

  private async seed() {
    for (const page of DEFAULT_CONTENT_PAGES) {
      const existing = await this.pages.findOne({ where: { slug: page.slug } });
      if (!existing) {
        await this.pages.save(this.pages.create(page));
      }
    }

    const count = await this.entities.count();
    if (count === 0) {
      const samples = [
        {
          name: 'Домик у озера',
          slug: 'domik-u-ozera',
          description:
            'Уютный деревянный домик на двоих с видом на озеро и террасой.',
          bookingType: 'daily' as const,
          pricePerDay: 4500,
          capacity: 2,
          amenities: ['Wi-Fi', 'Кухня', 'Парковка', 'Мангал'],
          imageUrl: '/images/cabin.jpg',
        },
        {
          name: 'Баня',
          slug: 'banya',
          description: 'Русская баня с парилкой и зоной отдыха.',
          bookingType: 'hourly' as const,
          pricePerDay: 0,
          pricePerHour: 1500,
          capacity: 6,
          amenities: ['Парилка', 'Душ', 'Комната отдыха'],
          imageUrl: '/images/banya.jpg',
        },
        {
          name: 'Беседка с мангалом',
          slug: 'besedka',
          description: 'Просторная беседка для компании до 12 человек.',
          bookingType: 'hourly' as const,
          pricePerDay: 0,
          pricePerHour: 800,
          capacity: 12,
          amenities: ['Мангал', 'Стол', 'Освещение'],
          imageUrl: '/images/gazebo.jpg',
        },
      ];
      for (const sample of samples) {
        await this.entities.save(this.entities.create({ ...sample, isActive: true }));
      }
    }
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]+/gi, '-')
      .replace(/^-|-$/g, '');
  }

  private toEntity(item: EntityRecord) {
    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      imageUrl: item.imageUrl,
      bookingType: item.bookingType,
      pricePerDay: Number(item.pricePerDay),
      pricePerHour: item.pricePerHour ? Number(item.pricePerHour) : undefined,
      capacity: item.capacity,
      amenities: item.amenities,
      isActive: item.isActive,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
