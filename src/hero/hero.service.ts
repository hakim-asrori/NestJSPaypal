import { Injectable } from "@nestjs/common";
import { Hero } from "./hero/interfaces/hero.interface";

@Injectable()
export class HeroService {
    private readonly heroes: Hero[] = [
        {
            id: 1,
            nama: "Harley",
            type: "Mage"
        },
        {
            id: 2,
            nama: "Minotaur",
            type: "Tank"
        },
        {
            id: 3,
            nama: "Johnson",
            type: "Tank"
        }
    ]

    create(hero: Hero) {
        this.heroes.push(hero)
    }

    findAll(): Hero[] {
        return this.heroes
    }
}