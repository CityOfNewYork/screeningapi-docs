### Person
|Name|Description|Data Attribute|Value|
|-|-|-|-|
|Age|The age of the person.|age|Integer|Integer greater than 0. <br>Example: 31|
|Student|Whether the person is a student or not.|student|true/false|
|Full-time Student|Whether the person is a full-time student or not.|studentFulltime|true/false|
Pregnant|Whether the person is pregnant or not.|pregnant|true/false|
Unemployed|Whether the person is employed or not.|unemployed|true/false|
Unemployed and Worked in the Last 18 Months|Whether the person is unemployed and worked within the last 18 months.|unemployedWorkedLast18Months|true/false|
Is Blind|Whether the person is blind or not.|blind|true/false|
Has any Disabilities|Whether the person has disabilities or not.|disabled|true/false|
|Veteran|Whether the person is a veteran or not.|veteran|true/false|
|Receives Medicaid Benefits|Whether the person receives medicaid benefits or not.|benefitsMedicaid|true/false|
|Receives Disability-related Medicaid Benefits|Whether the person receives disability-related medicaid benefits or not.|benefitsMedicaidDisability|true/false|
|Is the Head of the Household.|Whether the person is the head of household or not. Note, only one person can be the head of household.|headOfHousehold|true/false|
|Relation to the Head of Household|If person isn’t the head of household, what is their relation to the head of household (see below).|
headOfHouseholdRelation|
String|Blank (“”) or one of the strings below below.|
||Child||Child
||Foster Child||FosterChild
||Step-child||StepChild
||Grandchild||Grandchild
||Spouse||Spouse
||Parent||Parent
||Foster Parent||FosterParent
||Step-parent||StepParent
||Grandparent||Grandparent
||Sister/Brother||SisterBrother
||Step-sister/Step-brother||StepSisterStepBrother
||Boyfriend/Girlfriend||BoyfriendGirlfriend
||Domestic Partner||DomesticPartner
||Unrelated||Unrelated
||Related in some other way||Other
|Owner or on deed|If the household owns the home, is the person the owner or on the deed.|livingOwnerOnDeed|true/false|
|Renting and on the Rental Lease.|If the household rental is renting, whether the person on the lease or not.|livingRentalOnLease|true/false|
|Income|A collection of one or more income objects.|incomes|`[{ “amount”: “200.00”, “type”: “Veteran”, “frequency”: “monthly”}, ...]`
||**Income amount.** The dollar amount of the income.|amount|Value greater than or equal to 0.<br>Example: 200.00|
||**Income type.** The type of the income (see below).|type|One of the strings below.|
||Wages, salaries, tips.||Wages|
||Self-employment income.||SelfEmployment|
||Unemployment benefits.||Unemployment|
||Cash Assistance grant.||CashAssistance|
||Child support (received).||ChildSupport|
||Disability-related Medicaid.||DisabilityMedicaid|
||Supplemental Security Income (SSI).||SSI|
||Social Security Dependent benefits.||SSDependent|
||Social Security Disability benefits.||SSDisability|
||Social Security Survivor’s benefits.||SSSurvivor|
||Social Security Retirement benefits.||SSRetirement|
||New York State Disability benefits.||NYSDisability|
||Veteran’s Pension or benefits.||Veteran|
||Government or Private Pension.||Pension|
||Withdrawals from Deferred Compensation (IRA, Keogh, etc.).||DeferredComp|
||Worker’s Compensation.||WorkersComp|
||Alimony (received).||Alimony|
||Boarder or lodger.||Boarder|
||Gifts/contributions (received)||Gifts|
||Rental income.||Rental|
||Investment income (interest, dividends, and profit from selling stocks).||Investment|
||**Income frequency.** How often the income is received.|frequency|One of the strings below.|
||Every week.||weekly|
||Every 2 weeks.||biweekly|
||Monthly||monthly|
||Twice a month.||semimonthly|
||Every year.||yearly||
Expenses| A collection of one or more expense objects. | expenses|`[{ “amount”: ”50.00”, “type”: ”Medical”, “frequency”: ”weekly”}, ...]`|
||**Expense amount.** The dollar amount of the expense.|amount|Value greater than or equal to 0.|Example: 50.00|
||**Expense type.** The type of the expense (see below).|type|One of the strings below.|
||Child care.||ChildCare|
||Child Support (paid).||ChildSupport|
||Dependent Care.||DependentCare|
||Rent||Rent|
||Medical expense||Medical|
||Heating||Heating|
||Cooling||Cooling|
||Mortgage||Mortgage|
||Utilities||Utilities|
||Telephone||Telephone|
||Third party insurance premiums.||InsurancePremiums|
||**Expense frequency.** How often the expense is paid (see below).|frequency|One of the strings below.|
||Every week.||weekly|
||Every 2 weeks.||biweekly|
||Monthly||monthly|
||Twice a month.||semimonthly|
||Every year.||yearly|

