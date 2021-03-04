### Household

| Name                          | Description                                                                                                                    | Data Attribute            | Type and/or Value |
|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------|---------------------------|-------------------|
| **Cash On Hand**              | How much does your whole household has right now in; cash on hand, checking or saving accounts, stocks, bonds or mutual funds. | `cashOnHand`              | **Number** greater than or equal to 0. *Example: 2000.00* |
| **Renting**                   | Renting the current living situation.                                                                                          | `livingRenting`           | **Boolean** |
| **Housing Rental Type**       | The type of rental, if renting.                                                                                                | `livingRentalType`        | **String** Blank (“”) or one listed below. |
|                               | Non-Regulated or Market Rate apartment.                                                                                        |                           | *MarketRate* |
|                               | Rent controlled or rent stabilized apartment.                                                                                  |                           | *RentControlled* |
|                               | Family Home.                                                                                                                   |                           | *FamilyHome* |
|                               | Condo.                                                                                                                         |                           | *Condo* |
|                               | NYCHA Housing.                                                                                                                 |                           | *NYCHA* |
|                               | Rent Regulated Hotel/Single Room.                                                                                              |                           | *RentRegulatedHotel* |
|                               | Section 213 apartments.                                                                                                        |                           | *Section213* |
|                               | Limited Dividend development apartments.                                                                                       |                           | *LimitedDividendDevelopment* |
|                               | Mitchell-Lama apartments.                                                                                                      |                           | *MitchellLama* |
|                               | Redevelopment Company apartments.                                                                                              |                           | *RedevelopmentCompany* |
|                               | Housing Development Fund Company (HDFC) Cooperative.                                                                           |                           | *HDFC* |
| **Owner of the Home or Apt.** | A household member owns the home or apartment.                                                                                 | `livingOwner`             | **Boolean**|
| **Staying with a Friend**     | Staying with a friend                                                                                                          | `livingStayingWithFriend` | **Boolean**|
| **Hotel**                     | In a hotel.                                                                                                                    | `livingHotel`             | **Boolean**|
| **Shelter or Homeless**       | In a shelter or homeless.                                                                                                      | `livingShelter`           | **Boolean**|
| **Prefer not to Say**         | Preference to not disclose housing.                                                                                            | `livingPreferNotToSay`    | **Boolean**|
