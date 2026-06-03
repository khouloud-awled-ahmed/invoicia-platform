import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentParserController } from './document-parser.controller';
import { UniversalDocumentParserService } from './services/universal-document-parser.service';
import { ParsingTemplate, ParsingTemplateSchema } from './schemas/parsing-template.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ParsingTemplate.name, schema: ParsingTemplateSchema }]),
  ],
  controllers: [DocumentParserController],
  providers: [UniversalDocumentParserService],
  exports: [UniversalDocumentParserService], // Export pour que d'autres modules puissent l'utiliser
})
export class DocumentParserModule {}
