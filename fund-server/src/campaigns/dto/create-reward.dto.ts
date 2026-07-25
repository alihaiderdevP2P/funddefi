import { IsString, IsNumber, IsDateString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateRewardDto {
  @ApiProperty({ description: "Reward title" })
  @IsString()
  title: string;

  @ApiProperty({ description: "Reward description" })
  @IsString()
  description: string;

  @ApiProperty({ description: "Minimum contribution amount in ETH" })
  @IsNumber()
  minAmount: number;

  @ApiProperty({ description: "Estimated delivery date", required: false })
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @ApiProperty({ description: "Maximum number of backers", required: false })
  @IsOptional()
  @IsNumber()
  maxBackers?: number;

  @ApiProperty({ description: "Reward image URL", required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
