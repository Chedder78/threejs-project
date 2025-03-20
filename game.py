import pygame
from ship import Ship
from asteroid import Asteroid
from bullet import Bullet

class Game:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.ship = Ship(width, height)
        self.asteroids = [Asteroid(width, height) for _ in range(5)]
        self.bullets = []
        self.score = 0
        self.game_over = False
        self.font = pygame.font.SysFont("Cinzel Decorative", 28, bold=True)

    def reset(self):
        self.__init__(self.width, self.height)

    def update(self):
        if self.game_over:
            return
        keys = pygame.key.get_pressed()
        self.ship.update(keys)
        for asteroid in self.asteroids:
            asteroid.update()
        for bullet in self.bullets[:]:
            bullet.update()
            if bullet.lifespan <= 0:
                self.bullets.remove(bullet)
        self.handle_collisions()

    def handle_collisions(self):
        for bullet in self.bullets[:]:
            for asteroid in self.asteroids[:]:
                if bullet.position.distance_to(asteroid.position) < asteroid.size * 10:
                    self.bullets.remove(bullet)
                    self.asteroids.remove(asteroid)
                    self.score += 100
                    if asteroid.size > 1:
                        self.asteroids.append(Asteroid(self.width, self.height, pos=asteroid.position, size=asteroid.size - 1))
                        self.asteroids.append(Asteroid(self.width, self.height, pos=asteroid.position, size=asteroid.size - 1))
                    break
        for asteroid in self.asteroids:
            if self.ship.position.distance_to(asteroid.position) < asteroid.size * 10:
                self.game_over = True

    def draw(self, surface):
        self.ship.draw(surface)
        for asteroid in self.asteroids:
            asteroid.draw(surface)
        for bullet in self.bullets:
            bullet.draw(surface)
        self.draw_hud(surface)

    def draw_hud(self, surface):
        text = self.font.render(f"Score: {self.score}", True, (255, 0, 255))
        surface.blit(text, (10, 10))
        if self.game_over:
            over = self.font.render("GAME OVER - Press R", True, (255, 255, 0))
            surface.blit(over, (self.width // 2 - over.get_width() // 2, self.height // 2))
