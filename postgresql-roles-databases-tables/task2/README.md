`library_guest`-ը ստեղծվել է առանց `LOGIN` attribute-ի, ուստի չի կարող մուտք գործել PostgreSQL։

`library_staff`-ը ստեղծվել է `LOGIN` attribute-ով և `PASSWORD`-ով, ուստի կարող է մուտք գործել PostgreSQL և ունի `books` աղյուսակը կարդալու (`SELECT`) permission։

**Արդյունք՝** `library_guest`-ի մուտքի փորձը ձախողվեց, քանի որ role-ը չունի `LOGIN` privilege։ `library_staff`-ի մուտքը հաջողությամբ իրականացվեց, և նրան տրված `SELECT` privilege-ի շնորհիվ նա կարողացավ կարդալ `books` աղյուսակի տվյալները։

