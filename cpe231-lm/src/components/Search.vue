<template>
    <b-container fluid style="padding : 0px;" >
        <b-row>
            <b-col>
                <nav class="navbar navbar-expand-md navbar-light" style="background-color: #c4c4c4">
                <img width="120" height="120" src="@/assets/LBEZ.png" style="margin-left:150px" @click="$router.push('/')" >
                    <ul class="navbar-nav" style="position: absolute; right: 100px;">
                    <li class="nav-item">
                        <a class="nav-link" @click="$router.push('/')">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click="$router.push('/about')">About</a>
                     </li>
                    <li class="nav-item dropdown">
                        <b-nav-item-dropdown id="nav7_ddown" text="Service" extra-toggle-classes="nav-link-custom" right>
                        <b-dropdown-item @click="$router.push('/search')"> Search book</b-dropdown-item>
                        </b-nav-item-dropdown>  
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click="$router.push('')">Guest</a> 
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click="$router.push('/login')">Log In</a>
                    </li>
                    </ul>
                </nav>
                </b-col>
        </b-row>
        <b-row>
            
                <div class="col-sm-6" style ="margin-top:20px;margin-left: auto;margin-right: auto;max-width:500px">
                    <b-form-input 
                        v-model="search"
                        type="text"
                        placeholder="search book from title/publisher/ISBN"
                        style="">
                        
                    </b-form-input>
                <div class="searchicon" style="margin-right: 10px" >
                    <span class="glyphicon glyphicon-search"></span>
                </div>
                </div>  
        </b-row>
        <b-row><h3 style="margin-left:auto;margin-right:auto;padding-top:10px;">Result</h3></b-row>
        <b-row>
        <b-col sm="3"></b-col>
        <b-col sm="6">
        <div v-if="Math.random() > 0.5">
        <table class="table" style="width: 100% ;" >
            <tr style="font-style:rugular;text-align : center;">
                <th>Title</th><th>Author</th><th>ISBN</th><th>Shelt</th>
            </tr>
            <tr style="font-size:16px; text-align : center">
                <td>CSS</td><td>w3school</td><td>48</td><td>B13</td>
            </tr>
              </table>
        </div>
        <div v-else>
            <h2 style="text-align: center;">Not Found</h2>
        </div>
        </b-col>
        <b-col sm="3"></b-col>
        </b-row>
    </b-container>
    
</template>

<script>
export default {name: 'search',
  data () {
    return {
      search: ''
    }
  }
}
</script>

<style scoped>
    .searchicon{
        font-size: 25px;
    }
</style>

