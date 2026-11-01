from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError("Email is required")
        user = self.model(email=self.normalize_email(email).lower(), **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra):
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        extra.setdefault("role", User.Role.ADMIN)
        return self.create_user(email, password, **extra)


class User(AbstractUser):
    class Role(models.TextChoices):
        DONOR = "DONOR", "Donor"
        REQUESTER = "REQUESTER", "Patient / family"
        HOSPITAL = "HOSPITAL", "Hospital staff"
        ADMIN = "ADMIN", "Admin"

    username = None
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=120)
    phone = models.CharField(max_length=20, blank=True)
    city = models.CharField(max_length=80, blank=True)
    role = models.CharField(max_length=12, choices=Role.choices, default=Role.DONOR)
    hospital = models.ForeignKey(
        "hospitals.Hospital", null=True, blank=True, on_delete=models.SET_NULL, related_name="staff"
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]
    objects = UserManager()

    def __str__(self):
        return f"{self.full_name} <{self.email}>"
