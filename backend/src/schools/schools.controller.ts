import { Controller, Get, Param } from '@nestjs/common';
import { SchoolsService } from './schools.service';

@Controller('schools')
export class SchoolsController {
    constructor(private schoolsService: SchoolsService) { }

    // Get first school (default)
    @Get()
    async getDefaultSchool() {
        return this.schoolsService.getSchool();
    }

    // Get school by ID
    @Get(':id')
    async getSchool(@Param('id') id: string) {
        return this.schoolsService.getSchool(id);
    }
}
