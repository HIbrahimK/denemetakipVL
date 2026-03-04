import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[çÇ]/g, 'c')
      .replace(/[ğĞ]/g, 'g')
      .replace(/[ıİ]/g, 'i')
      .replace(/[öÖ]/g, 'o')
      .replace(/[şŞ]/g, 's')
      .replace(/[üÜ]/g, 'u')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async create(dto: CreateBlogPostDto) {
    let slug = dto.slug || this.generateSlug(dto.title);

    // Ensure unique slug
    const existing = await (this.prisma as any).blogPost.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    return (this.prisma as any).blogPost.create({
      data: {
        ...dto,
        slug,
        tags: dto.tags || [],
        publishedAt: dto.status === 'PUBLISHED' ? new Date() : null,
      },
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.category) {
      where.category = params.category;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { excerpt: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      (this.prisma as any).blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      (this.prisma as any).blogPost.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPublished(params: { page?: number; limit?: number; category?: string }) {
    return this.findAll({ ...params, status: 'PUBLISHED' });
  }

  async findBySlug(slug: string) {
    const post = await (this.prisma as any).blogPost.findUnique({ where: { slug } });
    if (!post) throw new NotFoundException('Blog yazısı bulunamadı');

    // Increment view count
    await (this.prisma as any).blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });

    return post;
  }

  async findById(id: string) {
    const post = await (this.prisma as any).blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog yazısı bulunamadı');
    return post;
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    const post = await (this.prisma as any).blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog yazısı bulunamadı');

    const data: any = { ...dto };

    // If slug changed, regenerate
    if ((dto as any).title && !(dto as any).slug) {
      data.slug = this.generateSlug((dto as any).title);
      const existing = await (this.prisma as any).blogPost.findFirst({
        where: { slug: data.slug, id: { not: id } },
      });
      if (existing) data.slug = `${data.slug}-${Date.now()}`;
    }

    // If publishing for first time
    if ((dto as any).status === 'PUBLISHED' && !post.publishedAt) {
      data.publishedAt = new Date();
    }

    return (this.prisma as any).blogPost.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const post = await (this.prisma as any).blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog yazısı bulunamadı');

    await (this.prisma as any).blogPost.delete({ where: { id } });
    return { success: true, message: 'Blog yazısı silindi' };
  }

  async getCategories() {
    const posts = await (this.prisma as any).blogPost.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    return posts.map((p: any) => p.category);
  }
}
