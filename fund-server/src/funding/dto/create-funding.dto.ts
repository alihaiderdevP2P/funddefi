import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsObject,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { FundingStatus } from "../entities/funding.entity";

export class CreateFundingDto {
  @ApiProperty({ description: "Funding amount in ETH" })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: "Transaction hash" })
  @IsString()
  transactionHash: string;

  @ApiProperty({ description: "Campaign ID" })
  @IsString()
  campaignId: string;

  @ApiProperty({ description: "Reward ID", required: false })
  @IsOptional()
  @IsString()
  rewardId?: string;

  @ApiProperty({
    description: "Funding status",
    enum: FundingStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(FundingStatus)
  status?: FundingStatus;

  @ApiProperty({ description: "Backer message", required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ description: "Backer information", required: false })
  @IsOptional()
  @IsObject()
  backerInfo?: {
    name?: string;
    email?: string;
    address?: string;
  };
}
