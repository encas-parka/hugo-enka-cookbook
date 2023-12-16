  {{/*  ::: VueApp  */}}
  const app = new Vue ({
    delimiters: ['[[', ']]'],
    el: '#app',
    data () {
      return {
        search: '',
        selected: [],
        datesRepas: [], // liste des dates entre 1er et dernier repas : pour les date marqué event dans le date-picker
        startDate: null, // re-initialisé dans mounted().
        endDate: null,
        startDateSelected: null,
        endDateSelected: null, 
        endDateSelectedDebug: null,
        endDateAllowed: null,
        startDateMenu: false,
        endDateMenu: false,
        showAllColIngredients: true, {{/* TEST */}}
        {{/*  ingredientsTypesList: [{{ print $IngredientsTypesList }}],  */}}
       

        ingredientsRecettes: [
          {{ range $IngredientList }}
          {
            ingredient: "{{ .ingredient }}",
            ingredientType: "{{ .ingType }}",
            unit: "{{ .unit }}",
            quantite: {{ .quantite }},
            recette: "{{ .recette }}",
            dateService:'{{ .dateService }}',
            horaire: "{{ .horaire }}",
            typePlat: "{{ .typePlat }}",
            assiettesRecettes: {{ .assiettesRecettes }},
            assiettes: {{ .assiettes }},
          },
          {{ end }}
          ],

              
          totalsEachIngredientHeaders: [
          { text: 'Ingrédient', value: 'ingredient' },
          { text: 'par recette', value: 'recette'},
          { text: 'Quantité totale', value: 'total', align: 'right' },
          ],

        IngredientsRepasHeaders: [
          { text: "Ingredient", value: "name", filterable: true},
          { text: "", value: "ingredient", filterable: true},
          { text: "Recette", value: "recette"},
          { text: "quantité", align: "end", filterable: false, value: "quantite" },
          ], 

        displayDetails: true,
        

        {{/*  ::: ___Print parameters  */}}
        {{/*  elementsToPrint: ['all'],  */}}
        printSelectIng: false,
        toPrint: {
          recettes: true,
          ingredients: true,
          ingredientsDetail: false,
          {{ range $IngredientsTypesList -}}
          {{.iType}}: true,
          {{ end -}}
          {{ range $recettesList -}}
            "recetteID{{.recetteKey}}": true,
          {{ end -}}
        },

        printAddCol: ['3'],
    

        {{/*  printAffiches: false,  */}}

        printDialog: false,
        IngredientsTypesList: [{{ range $IngredientsTypesList }} {{ .iType }}, {{ end }} ],
      
        ranges: [], // Tableau pour stocker les tranches de dates
        daysPerRange: 3,
        configDPStart: {
          enableTime: false,
          dateFormat: "Y-m-d",
          altInput: true,
          altFormat: "D d M",
        },


  } {{/* return */}}    
}, {{/* data */}}


{{/* ::: mounted */}}
mounted () {


  {{/*  ::: __date range  */}}
  datesRange: {
    // Trouver la première et la dernière date dans les données
    this.startDate = new Date(Math.min(
      ...this.ingredients.map(i => {
        return new Date(i.dateService);
      }),
      ),
    );
    this.endDate = new Date(Math.max(
      ...this.ingredients.map(i => {
        return new Date(i.dateService);
      }),
      ),
    );

    this.startDate = new Date(this.startDate).toISOString().substr(0, 10);
    this.endDate = new Date(this.endDate).toISOString().substr(0, 10);

    this.startDateSelected = this.startDate;
    this.endDateSelected = this.endDate
    // Derniere date autorisée dans la sélection (ne sera pas mutable puisque dans `mounted:`)
    this.endDateAllowed = this.endDateSelected;


  };

  datesRepasGen: {
    // Creer un tableau avec toutes les dateService, éliminer les doublon (Set). Défini le parametre `datesRepas` de `data()`, pour mettre en evidence les dateq où il y a des évenement dans les date-picker; TODO : est-ce encore utile maintenant que les `allowed-dates` fonctionne bien ? doublon ? Ne creer pas les date intermédiare si il y a des trou =>
    const dates = this.ingredients.map(i => {
      const datesFormat = i.dateService;
      return new Date(datesFormat).toISOString().substr(0, 10) // formatage
    });

    this.datesRepas = Array.from(new Set(dates)).sort(); 
  };

  rangeDateEvents: {
    this.splitDateRanges();

  };

  endDateDebugGen: {
    /* Ajoute un jour a la endDateSelected, pour que les derniers jours soit bien pris en compte par le filtre opéré dans totalsIngredientFiltered.
    Meme fonction dans watch() pour la mise a jour en fonction de la selection dans le date-picker */
    const lastDateSelected = new Date(this.endDateSelected)
    this.endDateSelectedDebug = new Date(lastDateSelected.setDate(lastDateSelected.getDate() + 1 )).toISOString().substr(0, 10);
  };

  {{/*  ::: __flatpikr  */}}
  datePickerInit: {
    const datePicker = this.datePickerReset();
  };


}, // mounted() end

{{/*  :::Computed  */}}

computed: { 

  {{/*  #USELESS #TODO : faire le calcul en dure avec Hugo  → au moins pour le produit en croix*/}}
  ingredients: function () {
    return this.ingredientsRecettes.map(ingredient => {
      let quantite = this.computeQuantite(ingredient);
      return {
        ... ingredient,
        quantite: quantite,
      }
    });
  },


  {{/*  totalsIngredientsFrais3Days: function (){
    const totalsIngredientFiltered = totalsIngredientsFiltered(Frais)
  },  */}}


  
  


}, // computed end

{{/*  ::: watch  */}}
watch: {

  endDateSelected: function () {
    /* Ajoute un jour a la endDateSelected, pour que les derniers jours soit bien pris en compte par le filtre opéré dans totalsIngredientFiltered. 
    Meme fonction dans mounted() pour l'initialisation ! Doit etre dans watch() sinon les changement de endDateSelected ne sont pas pris en compte... */ 
    const lastDateSelected = new Date(this.endDateSelected)
    this.endDateSelectedDebug = new Date(lastDateSelected.setDate(lastDateSelected.getDate() + 1 )).toISOString().substr(0, 10);
  }


}, // watch() end

{{/*  ::: methods  */}}
methods: { 


  {{/*  ::: __print  */}}
  printThis(el, section) {
    this.$nextTick(() => {
      let printThat = [el, section];
      Object.keys(this.toPrint).forEach((param) => {
        if (!printThat.includes(param)) {
          this.toPrint[param] = false;
        } else {
          this.toPrint[param] = true;
        }
      });
       this.$nextTick(() => {
         window.print();
       });
      });
  },

  {{/*  AddPrintCol(nb) {
    if this.printCol.includes(nb) {
      
    }
  }  */}}

  print() {
    this.printDialog = false;
    window.print();
  },

  {{/*  USELESS . C'est quoi ? Pas de reference  */}}
  updateSelectedAttribute (e) {
    let sel, i;

    sel = document.getElementById(e.target.id);
          // remove 'selected' from prior user selection
    for (i = 0; i < sel.length; i += 1) {
      sel[i].removeAttribute("selected");
    }
          // and add 'selected' to current selection
    sel[sel.selectedIndex].setAttribute("selected", "selected");
  },

  {{/*  :::__Date picker reset  */}}
  
  datesReset: function () {
    this.startDateSelected = this.startDate;
    this.endDateSelected = this.endDateAllowed;
    const datePickerReset = this.datePickerReset();
  },

  datePickerReset() {
 
    const configDPStart = {
      enableTime: false,
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "D d M",
      defaultDate: this.startDate,
      minDate: this.startDate,
      maxDate: this.endDateAllowed,
    };
    const configDPEnd = {
      enableTime: false,
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "D d M",
      defaultDate: this.endDateAllowed,
      minDate: this.startDate,
      maxDate: this.endDateAllowed,
    };
 
    flatpickr(datepickerStart, configDPStart);
    flatpickr(datepickerEnd, configDPEnd);   
   
  },

  computeQuantite: function (ingredient) {
   // Recalcule les quantité d'ingredients en fonctions du nombre d'assietes prévues  
    let x = (Number(ingredient.quantite));
    if (typeof ingredient.quantite != "number") {
      ingredient.quantite = '-';
    } else if (ingredient.unit == "Kg" || ingredient.unit == "litre") {
      ingredient.quantite = Math.round(x * 100) / 100;
    } else if (ingredient.unit == "grammes") {
      ingredient.quantite = Math.round(x);
      if (ingredient.quantite > 1000) {
        ingredient.unit = "Kg"
        ingredient.quantite = ingredient.quantite / 1000      
      }
    } else {
      ingredient.quantite = Math.round(x * 10) / 10;
    }
    return ingredient.quantite;
  },

  convertToKg: function (quantite, unit) {
    return quantite / 1000;
  },

  {{/*  ::: date split range   */}}
  splitDateRanges() {
      const { datesRepas, daysPerRange } = this;
      let currentRange = [];

      for (let i = 0; i < datesRepas.length; i++) {
        if (currentRange.length === 0) {
          currentRange.push(datesRepas[i]);
        } else {
          const currentDate = new Date(datesRepas[i]);
          const previousDate = new Date(currentRange[currentRange.length - 1]);

          const diffInDays = (currentDate - previousDate) / (1000 * 60 * 60 * 24);

          if (diffInDays === 1) {
            currentRange.push(datesRepas[i]);
          } else {
            // Si la différence n'est pas de 1 jour, cela signifie une nouvelle tranche
            if (currentRange.length >= daysPerRange) {
              this.ranges.push(currentRange);
            }
            currentRange = [datesRepas[i]];
          }
        }
      }

      // Ajoutez la dernière tranche s'il y a lieu
      if (currentRange.length >= daysPerRange) {
        this.ranges.push(currentRange);
      }

  },


  {{/* ::: calculs des totaux des ingredients  */}}
  filteredIngredients: function (iType, startDate, endDate) {
    // Récupérer la liste des ingrédients
    let ingredients = this.ingredients

    // Si pas de valeurs definies, alors les dates sont celles du datepicker
    var startDate = startDate === '' ? this.startDateSelected : startDate;
    var endDate = endDate === '' ? this.endDateSelected : endDate;

    // Filtrer les ingrédients selon les critères spécifiés
    const filtered = ingredients.filter(
      (i) =>
        i.ingredientType === iType &&
        i.dateService >= this.startDateSelected &&
        i.dateService <= this.endDateSelectedDebug &&
        i.ingredient.toLowerCase().includes(this.search.toLowerCase())
    );
    return filtered
  },

  totalsIngredients: function (filteredIng) {
    const totals = [];
    const listQuantite = new Map();

    filteredIng.forEach((item) => {
      // Vérifier si l'ingrédient est déjà présent dans la carte des quantités
      if (!listQuantite.has(item.ingredient)) {
        // Si non, ajouter une entrée vide pour cet ingrédient
        listQuantite.set(item.ingredient, []);
      }

      // Vérifier si une quantité avec la même unité existe déjà pour cet ingrédient
      const existingQuantity = listQuantite
        .get(item.ingredient)
        .find((quantity) => quantity.unit === item.unit);

      if (existingQuantity) {
        // Si une quantité existe déjà, additionner la quantité actuelle à celle existante
        existingQuantity.quantite += item.quantite;
      } else {
        // Sinon, ajouter une nouvelle quantité à la liste des quantités pour cet ingrédient
        listQuantite.get(item.ingredient).push({
          quantite: item.unit === 'grammes' ? this.convertToKg(item.quantite) : item.quantite,
          unit: item.unit,
        });
      }

      // Vérifier si l'ingrédient existe déjà dans les totaux
      if (!totals[item.ingredient]) {
        // Si non, initialiser les totaux pour cet ingrédient
        totals[item.ingredient] = {
          unitTotal: item.unit,
          total: 0,
        };
      }

      // Vérifier si l'unité de l'ingrédient correspond à l'unité actuelle
      if (totals[item.ingredient].unitTotal === item.unit) {
        // Si oui, additionner la quantité à la totalité de l'ingrédient
        totals[item.ingredient].total += item.quantite;
      } else if (item.unit === 'grammes' && totals[item.ingredient].unitTotal === 'Kg') {
        // Si les unités sont différentes (grammes et Kg), convertir la quantité en Kg avant de l'ajouter à la totalité
        const total = this.convertToKg(item.quantite);
        totals[item.ingredient].total += total;
        totals[item.ingredient].unitTotal = 'Kg';

      } else {
        // Si les unités ne peuvent pas s'additionner ou sont de différentes natures, ajouter la quantité à la liste des quantités alternatives
        totals[item.ingredient] = {
          total: 'Incalculable...',
        };
      }

      // Arrondir à 2 décimales
      if (typeof totals[item.ingredient].total === 'number' && totals[item.ingredient].total > 0) {
        const rounded = totals[item.ingredient].total;
        totals[item.ingredient].total = Math.round(rounded * 100) / 100;
      } else if (totals[item.ingredient].total === 'Incalculable...') {
        // Si le total est incalculable, utiliser la liste des quantités alternatives
        totals[item.ingredient] = {
          total: 'Incalculable...',
          fallbackTotal: listQuantite.get(item.ingredient).map((quantity) => ({
            quantite: Math.round(quantity.quantite * 100) / 100,
            unit: quantity.unit,
          })),
        };
      } else {
        // Si le total n'est pas un nombre valide, le définir comme "non précisé"
        totals[item.ingredient].total = 'non précisé';
      }
    });

    // Retourner les totaux des ingrédients filtrés (trié par noms d'ingredients)
    return Object.entries(totals).map(([ingredient, { unitTotal, total, fallbackTotal, ...item }]) => ({
      ingredient,
      unitTotal,
      total,
      fallbackTotal,
      ...item,
    })).sort((a, b) => a.ingredient.localeCompare(b.ingredient));
  },

 
  totalsIngredientsFiltered(iType) {
    // Appeler la première méthode pour filtrer les ingrédients
    const filtered = this.filteredIngredients(iType);

    // Appeler la deuxième méthode pour calculer les totaux à partir des ingrédients filtrés
    const totals = this.totalsIngredients(filtered);

    // Retourner les totaux
    return totals;
  },

  totalsAndDetailIngredientsFiltered(iType) {
    const total = this.totalsIngredients(this.filteredIngredients(iType));
    const element = this.filteredIngredients(iType);

    const result = new Set([...element, ...total].sort((a, b) => a.ingredient.localeCompare(b.ingredient)));

    return result;
  },

  ingredientTypeList () {
    return [...new Set (this.ingredients.map(ingredient => ingredient.ingredientType))];
  },



  filteredResultsCount(iType) {
    return this.totalsIngredientFiltered(iType, 'ingredients').length;
  },

  datesAllowedRange: function (val) {
// retourne toutes les dates comprisent entre la premiere et la dernieres =>
    for(
      var datesAllowedArray=[],
      date=new Date(this.startDate); 
      date <= new Date(this.endDateAllowed); 
      date.setDate(date.getDate()+1)){
        datesAllowedArray.push(new Date(date).toISOString().substr(0, 10));
      }

    for (var i = 0; i < datesAllowedArray.length; i++) {
      if (datesAllowedArray[i] == val ){
        return val
      };
    }
  },


} {{/* fin de methods */}}
}); {{/* fin New Vue */}}



