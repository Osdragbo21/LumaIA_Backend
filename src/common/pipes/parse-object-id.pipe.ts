// [BACKEND] Ruta: src/common/pipes/parse-object-id.pipe.ts

import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<any, Types.ObjectId> {
  transform(value: any): Types.ObjectId {
    const validObjectId = Types.ObjectId.isValid(value);
    if (!validObjectId) {
      throw new BadRequestException(`El ID proporcionado (${value}) no es un formato válido de MongoDB.`);
    }
    return new Types.ObjectId(value);
  }
}