import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SearchService } from './search.service';

@Controller('search')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Get()
    @Roles('SCHOOL_ADMIN', 'TEACHER')
    async globalSearch(
        @Query('q') query: string,
        @Query('schoolId') schoolId: string,
    ) {
        if (!query || query.trim().length < 2) {
            return {
                students: [],
                exams: [],
                classes: []
            };
        }

        return this.searchService.globalSearch(query, schoolId);
    }

    @Get('autocomplete')
    @Roles('SCHOOL_ADMIN', 'TEACHER')
    async autocomplete(
        @Query('q') query: string,
        @Query('schoolId') schoolId: string,
    ) {
        if (!query || query.trim().length < 2) {
            return [];
        }

        return this.searchService.autocomplete(query, schoolId);
    }
}
