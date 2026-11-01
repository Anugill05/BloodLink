"""Blood-group compatibility rules.

Red cells (whole blood / PRBC): recipient antibodies attack donor antigens, so the donor's ABO
antigens must be a subset of the recipient's, and an Rh- recipient needs an Rh- donor.

Plasma: the reverse — donor plasma carries antibodies, so the donor's ABO antigens must be a
superset of the recipient's (AB plasma is universal). Rh is not considered for plasma.

Platelets: we follow the conservative red-cell rule; the hospital still cross-matches.

Ranking matters as much as eligibility: an exact match is always preferred, because burning a
scarce O-negative donor on an A+ patient who has A+ donors nearby hurts the next emergency.
"""
from django.db import models


class BloodGroup(models.TextChoices):
    O_NEG = "O-", "O−"
    O_POS = "O+", "O+"
    A_NEG = "A-", "A−"
    A_POS = "A+", "A+"
    B_NEG = "B-", "B−"
    B_POS = "B+", "B+"
    AB_NEG = "AB-", "AB−"
    AB_POS = "AB+", "AB+"


class Component(models.TextChoices):
    WHOLE_BLOOD = "WHOLE_BLOOD", "Whole blood"
    PRBC = "PRBC", "Packed red cells"
    PLATELETS = "PLATELETS", "Platelets"
    PLASMA = "PLASMA", "Plasma"


ALL_GROUPS = [g.value for g in BloodGroup]


def _split(group: str) -> tuple[set[str], bool]:
    abo, rh = group[:-1], group[-1]
    antigens = set() if abo == "O" else set(abo)
    return antigens, rh == "+"


def can_donate(donor: str, recipient: str, component: str = Component.WHOLE_BLOOD) -> bool:
    d_ag, d_pos = _split(donor)
    r_ag, r_pos = _split(recipient)
    if component == Component.PLASMA:
        return r_ag <= d_ag
    return d_ag <= r_ag and (r_pos or not d_pos)


def compatible_donor_groups(recipient: str, component: str = Component.WHOLE_BLOOD) -> list[str]:
    """Donor groups that can give to `recipient`, best-first (exact match, then same Rh, then rest)."""
    groups = [g for g in ALL_GROUPS if can_donate(g, recipient, component)]
    _, r_pos = _split(recipient)

    def rank(g):
        exact = g == recipient
        same_rh = _split(g)[1] == r_pos
        universal = g in ("O-", "AB+")  # keep universal donors/recipients for last resort
        return (not exact, not same_rh, universal, ALL_GROUPS.index(g))

    return sorted(groups, key=rank)


def can_receive_from(recipient: str, component: str = Component.WHOLE_BLOOD) -> list[str]:
    return compatible_donor_groups(recipient, component)


def can_give_to(donor: str, component: str = Component.WHOLE_BLOOD) -> list[str]:
    return [r for r in ALL_GROUPS if can_donate(donor, r, component)]
