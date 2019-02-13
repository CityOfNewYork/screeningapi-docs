### Household

|Name|Description|Data Attribute|Possible Value|
| ----- | ----- | ----- | ----- |
|Members|Number of People in the household. Directly related to the number of Person types. Minimum is 1 and maximum value is 8. |members|Integer|Integer greater than 0 <br> Example: 1|
| Cash On Hand | How much does your whole household has right now in; cash on hand, checking or saving accounts, stocks, bonds or mutual funds.| cashOnHand | Numeric value greater than or equal to 0. <br> Example: 2000.00
|Renting | Renting the current living situation.| livingRenting | true/false|
|Housing Rental Type |The type of rental, if renting. |livingRentalType|String |Blank (“”) or one of the strings below below.|
||Non-Regulated or Market Rate apartment.||MarketRate|
||Rent controlled or rent stabilized apartment.||RentControlled|
||Family Home.||FamilyHome|
||Condo.||Condo|
||NYCHA Housing.||NYCHA|
||Rent Regulated Hotel/Single Room.||RentRegulatedHotel|
||Section 213 apartments.||Section213|
||Limited Dividend development apartments.||LimitedDividendDevelopment|
||Mitchell-Lama apartments.||MitchellLama|
||Redevelopment Company apartments.||RedevelopmentCompany|
||Housing Development Fund Company (HDFC) Cooperative.||HDFC|
|Owner of the Home or Apt.|A household member owns the home or apartment.|livingOwner|true/false|
|Staying with a Friend|Staying with a friend|livingStayingWithFriend|true/false|
|Hotel|In a hotel.|livingHotel|true/false|
|Shelter or Homeless|In a shelter or homeless.|livingShelter|true/false|
|Prefer not to Say|Preference to not disclose housing.|livingPreferNotToSay|true/false|