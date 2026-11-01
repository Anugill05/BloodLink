from django.contrib.gis.db import models


class Hospital(models.Model):
    name = models.CharField(max_length=200)
    registration_number = models.CharField(max_length=60, unique=True)
    address = models.CharField(max_length=300)
    city = models.CharField(max_length=80, db_index=True)
    phone = models.CharField(max_length=20)
    location = models.PointField(geography=True, srid=4326)
    has_blood_bank = models.BooleanField(default=False)
    # Verified by a BloodLink admin after checking registration documents. Only verified
    # hospitals can approve patient requests — this is what keeps the feed free of fake asks.
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name}, {self.city}"
