### Person

|Name|Description|Data Attribute|Type and/or Value|
| ----- | ----- | ----- | ----- |
|<b class='whitespace-no-wrap'>Age|The age of the person.</b>|<code class='font-bold text-h5'>age</code>|<b class='text-primary-blue'>Integer</b>|
|<b class='whitespace-no-wrap'>Student|Whether the person is a student or not.</b>|<code class='font-bold text-h5'>student</code>|<b class='text-primary-blue'>Boolean</b>|
|<b class='whitespace-no-wrap'>Full-time Student</b>|Whether the person is a full-time student or not.|<code class='font-bold text-h5'>studentFulltime</code>|<b class='text-primary-blue'>Boolean</b>|
|<b class='whitespace-no-wrap'>Pregnant</b>|Whether the person is pregnant or not.|<code class='font-bold text-h5'>pregnant</code>|<b class='text-primary-blue'>Boolean</b>|
|<b class='whitespace-no-wrap'>Unemployed</b>|Whether the person is employed or not.|<code class='font-bold text-h5'>unemployed</code>|<b class='text-primary-blue'>Boolean</b>|
|<b class='whitespace-no-wrap'>Unemployed and Worked in the Last 18 Months</b>|Whether the person is unemployed and worked within the last 18 months.|<code class='font-bold text-h5'>unemployedWorkedLast18Months</code>|<b class='text-primary-blue'>Boolean</b>|
|<b class='whitespace-no-wrap'>Is Blind</b>|Whether the person is blind or not.|<code class='font-bold text-h5'>blind</code>|<b class='text-primary-blue'>Boolean</b>|
|<b class='whitespace-no-wrap'>Has any Disabilities</b>|Whether the person has disabilities or not.|<code class='font-bold text-h5'>disabled</code>|<b class='text-primary-blue'>Boolean</b>|
|<b class='whitespace-no-wrap'>Veteran</b>|Whether the person is a veteran or not.|<code class='font-bold text-h5'>veteran</code>|<b class='text-primary-blue'>Boolean</b>|
|<b class='whitespace-no-wrap'>Receives Medicaid Benefits</b>|Whether the person receives medicaid benefits or not.|<code class='font-bold text-h5'>benefitsMedicaid</code>|<b class='text-primary-blue'>Boolean</b>|
|<b class='whitespace-no-wrap'>Receives Disability-related Medicaid Benefits</b>|Whether the person receives disability-related medicaid benefits or not.|<code class='font-bold text-h5'>benefitsMedicaidDisability</code>|<b class='text-primary-blue'>Boolean</b>|
|<b class='whitespace-no-wrap'>Household Member Type</b>|What is this person's relation to the household?|<code class='font-bold text-h5'>householdMemberType</code>|Blank <b class='text-primary-blue'>String</b><em class='text-secondary-grey'>("")</em> or one listed below.|
||Head of Household||<em class='text-secondary-grey'>HeadOfHousehold</em>|
||Child||<em class='text-secondary-grey'>Child</em>|
||Foster Child||<em class='text-secondary-grey'>FosterChild</em>|
||Step-child||<em class='text-secondary-grey'>StepChild</em>|
||Grandchild||<em class='text-secondary-grey'>Grandchild</em>|
||Spouse||<em class='text-secondary-grey'>Spouse</em>|
||Parent||<em class='text-secondary-grey'>Parent</em>|
||Foster Parent||<em class='text-secondary-grey'>FosterParent</em>|
||Step-parent||<em class='text-secondary-grey'>StepParent</em>|
||Grandparent||<em class='text-secondary-grey'>Grandparent</em>|
||Sister/Brother||<em class='text-secondary-grey'>SisterBrother</em>|
||Step-sister/Step-brother||<em class='text-secondary-grey'>StepSisterStepBrother</em>|
||Boyfriend/Girlfriend||<em class='text-secondary-grey'>BoyfriendGirlfriend</em>|
||Domestic Partner||<em class='text-secondary-grey'>DomesticPartner</em>|
||Unrelated||<em class='text-secondary-grey'>Unrelated</em>|
||Related in some other way||<em class='text-secondary-grey'>Other</em>|
|<b class='whitespace-no-wrap'>Owner or on deed</b>|If the household owns the home, is the person the owner or on the deed.|<code class='font-bold text-h5'>livingOwnerOnDeed</code>|<b class='text-primary-blue'>Boolean</b>|
|<b class='whitespace-no-wrap'>Renting and on the Rental Lease</b>|If the household rental is renting, whether the person on the lease or not.|<code class='font-bold text-h5'>livingRentalOnLease</code>|<b class='text-primary-blue'>Boolean</b>|
|<b class='whitespace-no-wrap'>Income</b>|A collection of one or more income objects.|<code class='font-bold text-h5'>incomes</code>|<b class='text-primary-blue'>Array</b> of <b class='text-primary-blue'>Objects</b><div class='code-block small'><pre>[<br>  {<br>    \"amount\": \"200.00\",<br>    \"type\": \"Veteran\",<br>    \"frequency\": \"Monthly\"<br>  },<br>  … additional Incomes…<br>]</pre></div>|
||**Income amount.** The dollar amount of the income.|<code class='font-bold text-h5'>amount</code>|<b class='text-primary-blue'>Number</b> greater than or equal to 0. <span class='whitespace-no-wrap'><em class='text-secondary-grey'>Example: 200.00</em></span>|
||**Income type.** The type of the income (see below).|<code class='font-bold text-h5'>type</code>|Blank <b class='text-primary-blue'>String</b><em class='text-secondary-grey'>("")</em> or one listed below.|
||Wages, salaries, tips.||<em class='text-secondary-grey'>Wages</em>|
||Self-employment income.||<em class='text-secondary-grey'>SelfEmployment</em>|
||Unemployment benefits.||<em class='text-secondary-grey'>Unemployment</em>|
||Cash Assistance grant.||<em class='text-secondary-grey'>CashAssistance</em>|
||Child support (received).||<em class='text-secondary-grey'>ChildSupport</em>|
||Disability-related Medicaid.||<em class='text-secondary-grey'>DisabilityMedicaid</em>|
||Supplemental Security Income (SSI).||<em class='text-secondary-grey'>SSI</em>|
||Social Security Dependent benefits.||<em class='text-secondary-grey'>SSDependent</em>|
||Social Security Disability benefits.||<em class='text-secondary-grey'>SSDisability</em>|
||Social Security Survivor’s benefits.||<em class='text-secondary-grey'>SSSurvivor</em>|
||Social Security Retirement benefits.||<em class='text-secondary-grey'>SSRetirement</em>|
||New York State Disability benefits.||<em class='text-secondary-grey'>NYSDisability</em>|
||Veteran’s Pension or benefits.||<em class='text-secondary-grey'>Veteran</em>|
||Government or Private Pension.||<em class='text-secondary-grey'>Pension</em>|
||Withdrawals from Deferred Compensation (IRA, Keogh, etc.).||<em class='text-secondary-grey'>DeferredComp</em>|
||Worker’s Compensation.||<em class='text-secondary-grey'>WorkersComp</em>|
||Alimony (received).||<em class='text-secondary-grey'>Alimony</em>|
||Boarder or lodger.||<em class='text-secondary-grey'>Boarder</em>|
||Gifts/contributions (received)||<em class='text-secondary-grey'>Gifts</em>|
||Rental income.||<em class='text-secondary-grey'>Rental</em>|
||Investment income (interest, dividends, and profit from selling stocks).||<em class='text-secondary-grey'>Investment</em>|
||**Income frequency.** How often the income is received.|<code class='font-bold text-h5'>frequency</code>|One of the strings below.|
||Every week.||<em class='text-secondary-grey'>Weekly</em>|
||Every 2 weeks.||<em class='text-secondary-grey'>Biweekly</em>|
||Monthly||<em class='text-secondary-grey'>Monthly</em>|
||Twice a month.||<em class='text-secondary-grey'>Semimonthly</em>|
||Every year.||<em class='text-secondary-grey'>Yearly</em>||
|<b class='whitespace-no-wrap'>Expenses</b>| A collection of one or more expense objects. |<code class='font-bold text-h5'>expenses</code>|<b class='text-primary-blue'>Array</b> of <b class='text-primary-blue'>Objects</b> <div class='code-block small'><pre>[<br>  {<br>    \"amount\": \"50.00\",<br>    \"type\": \"Medical\",<br>    \"frequency\": \"Weekly\"<br>  },<br>  … additional Expenses…<br>]</pre></div>|
||**Expense amount.** The dollar amount of the expense.|<code class='font-bold text-h5'>amount</code>|Value greater than or equal to 0.|<b class='text-primary-blue'>Number</b> greater than or equal to 0. <span class='whitespace-no-wrap'><em class='text-secondary-grey'>Example: 2000.00</em></span>|
||**Expense type.** The type of the expense (see below).|<code class='font-bold text-h5'>type</code>|Blank <b class='text-primary-blue'>String</b><em class='text-secondary-grey'>("")</em> or one listed below.|
||Child care.||<em class='text-secondary-grey'>ChildCare</em>|
||Child Support (paid).||<em class='text-secondary-grey'>ChildSupport</em>|
||Dependent Care.||<em class='text-secondary-grey'>DependentCare</em>|
||Rent||<em class='text-secondary-grey'>Rent</em>|
||Medical expense||<em class='text-secondary-grey'>Medical</em>|
||Heating||<em class='text-secondary-grey'>Heating</em>|
||Cooling||<em class='text-secondary-grey'>Cooling</em>|
||Mortgage||<em class='text-secondary-grey'>Mortgage</em>|
||Utilities||<em class='text-secondary-grey'>Utilities</em>|
||Telephone||<em class='text-secondary-grey'>Telephone</em>|
||Third party insurance premiums.||<em class='text-secondary-grey'>InsurancePremiums</em>|
||**Expense frequency.** How often the expense is paid (see below).|<code class='font-bold text-h5'>frequency</code>|Blank <b class='text-primary-blue'>String</b><em class='text-secondary-grey'>("")</em> or one listed below.|
||Every week.||<em class='text-secondary-grey'>Weekly</em>|
||Every 2 weeks.||<em class='text-secondary-grey'>Biweekly</em>|
||Monthly||<em class='text-secondary-grey'>Monthly</em>|
||Twice a month.||<em class='text-secondary-grey'>Semimonthly</em>|
||Every year.||<em class='text-secondary-grey'>Yearly</em>|
