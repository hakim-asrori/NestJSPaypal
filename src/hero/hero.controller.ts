import { Body, Controller, Delete, Get, Header, HttpCode, Param, Post, Put, Redirect, Req, Res } from "@nestjs/common";
import { CreateHeroDto } from "./hero/dto/create-hero.dto";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { UpdateUserDto } from "src/user/dto/update-user.dto";
import { UpdateDtoHero } from "./hero/dto/update-hero.dto";
import { HeroService } from "./hero.service";

@Controller("hero")
export class HeroController {

    constructor(private heroService: HeroService) {}

    @Get("index")
    @HttpCode(200)
    @Header("Content-Type", "application/json")
    index(@Res() response) {
        response.json(this.heroService.findAll())
    }

    @Get("create")
    create(@Res({ passthrough: true }) response): String {
        response.cookie("name", "hamdan")
        return "Hero Create"
    }

    @Post("store")
    @HttpCode(201)
    store(@Req() request, @Body() createHeroDto: CreateHeroDto, @Res({passthrough: true}) response) {
        try {
            this.heroService.create(createHeroDto)
            return this.heroService.findAll()
        } catch (error) {
            response.status(500)
                .json({
                    "message": error
                })
        }
    }

    @Get("show/:id")
    show(@Param('id') id:number) {
        const hero = this.heroService.findAll().filter((hero) => {
            if (hero.id == id) {
                return hero.id == id
            }
        })

        return hero
    }

    @Put("update/:id")
    update(@Param("id") id: number, @Body() updateHeroDto: UpdateDtoHero) {
        this.heroService.findAll().filter((hero) => {
            if (hero.id == id) {
                hero.nama = updateHeroDto.nama
                hero.type = updateHeroDto.type
            }
        })

        return this.heroService
    }

    @Delete("destroy/:id")
    destroy(@Param("id") id:number) {
        const hero = this.heroService.findAll().filter((hero) => {
            return hero.id != id
        })

        return hero
    }

    @Get("/welcome")
    @Redirect("https://rtqulilalbab.com/")
    hello() {
        return "Welcome"
    }

}